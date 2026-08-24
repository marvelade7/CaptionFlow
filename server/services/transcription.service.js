const fs = require("fs");
const Groq = require("groq-sdk");
const Transcription = require("../models/transcription.model");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const path = require("path");
const { execSync } = require("child_process");
const { logActivity } = require("./activity.service");

// Prefer the system ffmpeg if available — the static binary (johnvansickle)
// is known to SIGSEGV on some Linux systems for certain video files.
function resolveFfmpegPath() {
    try {
        const sysBin = execSync("which ffmpeg", { stdio: ["pipe", "pipe", "ignore"] })
            .toString()
            .trim();
        if (sysBin) {
            console.log(`[FFmpeg] Using system binary: ${sysBin}`);
            return sysBin;
        }
    } catch (_) { /* not installed */ }
    console.log(`[FFmpeg] System ffmpeg not found, falling back to ffmpeg-static`);
    return ffmpegStatic;
}

ffmpeg.setFfmpegPath(resolveFfmpegPath());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Formats that Groq accepts natively and can be split without re-encoding
const COPY_SAFE_EXTS = new Set([".mp3", ".m4a", ".wav", ".flac"]);
// Video formats that require audio extraction before splitting
const VIDEO_EXTS = new Set([".mp4", ".mov", ".mkv", ".webm", ".mpeg", ".mpga"]);

// Max time to wait for all Groq chunks to come back (ms).
// Covers the worst case: 8 chunks × ~15s each with some slack.
const GROQ_TIMEOUT_MS = 90_000;

/**
 * Transcribe an audio/video file using Groq's Whisper API in the background.
 * Uses FFmpeg to split large files into chunks to bypass the 25MB limit.
 * For audio-only files (mp3, m4a, wav, flac), the stream is copied without
 * re-encoding — this reduces chunking time from ~100s to ~2s for most uploads.
 * @param {string} filePath - The local path to the original file.
 * @param {string} transcriptionId - The ID of the transcription record to update.
 */
const transcribeAudioJob = async (filePath, transcriptionId) => {
    const startTime = Date.now();
    let chunks = [];

    try {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            throw new Error("GROQ_API_KEY is not configured. Please add it to your .env file.");
        }

        // 1. Update status to processing
        await Transcription.findByIdAndUpdate(transcriptionId, { status: "processing", startedAt: new Date() });

        // Find user for analytics
        const doc = await Transcription.findById(transcriptionId);
        const userId = doc ? doc.userId : null;
        if (userId) logActivity("TRANSCRIPTION_STARTED", userId, { transcriptionId }).catch(() => { });

        // 2. Chunk the file — strategy depends on the input format + file size
        const CHUNK_DURATION_S = 300; // 5-minute segments
        const GROQ_DIRECT_LIMIT = 25 * 1024 * 1024; // 25 MB — Groq's upload cap
        const isUrl = filePath.startsWith("http://") || filePath.startsWith("https://");
        const ext = isUrl ? path.extname(new URL(filePath).pathname).toLowerCase() : path.extname(filePath).toLowerCase();
        const isAudioOnly = COPY_SAFE_EXTS.has(ext);
        const baseName = isUrl ? path.parse(new URL(filePath).pathname).name : path.parse(filePath).name;
        const chunkPrefix = path.join(require("os").tmpdir(), `${baseName}_${transcriptionId}_chunk_`);
        const chunkPattern = `${chunkPrefix}%03d.mp3`;

        // ── Fast path: file fits within Groq's 25MB direct upload limit.
        // Skip ffmpeg entirely — this avoids the SIGSEGV crash from ffmpeg-static
        // on modern Linux (glibc 2.43+) when processing video files.
        const fileSize = isUrl ? 0 : fs.statSync(filePath).size;
        const useDirectUpload = !isUrl && fileSize < GROQ_DIRECT_LIMIT;

        if (useDirectUpload) {
            console.log(`[Transcription] File is ${(fileSize / 1024 / 1024).toFixed(1)} MB — sending directly to Groq (no ffmpeg)`);
            chunks = [filePath]; // treat the original file as the single "chunk"
        } else {
            console.log(`[Transcription] Input: ${ext}, strategy: ${isAudioOnly ? "stream copy (no re-encode)" : "transcode (video → audio)"}`);
            const ffmpegStart = Date.now();

            await new Promise((resolve, reject) => {
                const cmd = ffmpeg(filePath);

                if (isAudioOnly) {
                    // ── Fast path: copy the audio bitstream directly, no decoding/re-encoding.
                    cmd
                        .outputOptions([
                            "-c copy",
                            "-f segment",
                            `-segment_time ${CHUNK_DURATION_S}`,
                            "-map 0:a:0",
                            "-reset_timestamps 1",
                        ])
                        .output(chunkPattern);
                } else {
                    // ── Slow path: video file — extract + transcode audio to MP3.
                    cmd
                        .noVideo()
                        .audioCodec("libmp3lame")
                        .audioBitrate("128k")
                        .audioChannels(1)
                        .outputOptions([
                            "-f segment",
                            `-segment_time ${CHUNK_DURATION_S}`,
                            "-compression_level 0",
                        ])
                        .output(chunkPattern);
                }

                cmd
                    .on("end", resolve)
                    .on("error", (err, stdout, stderr) => {
                        console.error("[FFmpeg stderr]:", stderr);
                        reject(new Error(`FFmpeg failed: ${err.message}${stderr ? " | " + stderr.slice(-500) : ""}`));
                    })
                    .run();
            });

            console.log(`[Transcription] FFmpeg chunking: ${Math.round((Date.now() - ffmpegStart) / 1000)}s`);

            // Gather generated chunk filenames
            let chunkIndex = 0;
            while (fs.existsSync(`${chunkPrefix}${String(chunkIndex).padStart(3, "0")}.mp3`)) {
                chunks.push(`${chunkPrefix}${String(chunkIndex).padStart(3, "0")}.mp3`);
                chunkIndex++;
            }

            if (chunks.length === 0) {
                throw new Error("FFmpeg failed to generate audio chunks.");
            }
        }

        console.log(`[Transcription] ${chunks.length} chunks ready, sending to Groq in parallel…`);

        // 3. Process all chunks IN PARALLEL with a hard timeout.
        // If internet drops mid-request, Promise.race rejects after GROQ_TIMEOUT_MS
        // instead of hanging until the OS eventually closes the socket.
        const timeoutGuard = new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error(
                    `Transcription timed out after ${GROQ_TIMEOUT_MS / 1000}s. ` +
                    "Please check your internet connection and try again."
                )),
                GROQ_TIMEOUT_MS
            )
        );

        const groqStart = Date.now();
        const transcriptionResults = await Promise.race([
            Promise.all(
                chunks.map((chunkPath) =>
                    groq.audio.transcriptions.create({
                        file: fs.createReadStream(chunkPath),
                        model: "whisper-large-v3-turbo",
                        response_format: "verbose_json",
                        language: "en",
                        temperature: 0.0,
                    })
                )
            ),
            timeoutGuard,
        ]);
        console.log(`[Transcription] Groq parallel transcription: ${Math.round((Date.now() - groqStart) / 1000)}s`);

        // Stitch results in order (Promise.all preserves insertion order)
        let fullTranscript = "";
        let fullSegments = [];
        let totalDuration = 0;

        transcriptionResults.forEach((transcription, i) => {
            fullTranscript += (fullTranscript ? " " : "") + transcription.text;

            const timeOffset = i * CHUNK_DURATION_S;
            if (transcription.segments) {
                transcription.segments.forEach(segment => {
                    fullSegments.push({
                        start: segment.start + timeOffset,
                        end: segment.end + timeOffset,
                        text: segment.text
                    });
                });
            }

            if (i === chunks.length - 1) {
                totalDuration += (transcription.duration || 0);
            } else {
                totalDuration += CHUNK_DURATION_S;
            }
        });

        const processingTime = Math.round((Date.now() - startTime) / 1000);
        console.log(`[Transcription] ✅ Total processingTime: ${processingTime}s`);

        // 4. Update DB with success
        const updatedDoc = await Transcription.findByIdAndUpdate(transcriptionId, {
            transcript: fullTranscript.trim(),
            segments: fullSegments,
            duration: Math.round(totalDuration),
            status: "completed",
            processingTime,
            completedAt: new Date(),
            chunkCount: chunks.length,
            successfulChunks: chunks.length,
            failedChunks: 0,
        });

        if (updatedDoc && updatedDoc.userId) {
            logActivity("TRANSCRIPTION_COMPLETED", updatedDoc.userId, { transcriptionId, processingTime }).catch(() => { });
        }

    } catch (error) {
        console.error("Transcription Job Error:", error.message);
        const updatedDoc = await Transcription.findByIdAndUpdate(transcriptionId, {
            status: "failed",
            errorMessage: error.message || "Failed to process audio file.",
            failedAt: new Date(),
        });
        if (updatedDoc && updatedDoc.userId) {
            logActivity("TRANSCRIPTION_FAILED", updatedDoc.userId, { transcriptionId, error: error.message }).catch(() => { });
        }
    } finally {
        // 5. Always clean up all temp files
        const isUrl = filePath.startsWith("http://") || filePath.startsWith("https://");
        if (!isUrl && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        chunks.forEach(chunkPath => {
            if (fs.existsSync(chunkPath)) fs.unlinkSync(chunkPath);
        });
    }
};

module.exports = { transcribeAudioJob };
