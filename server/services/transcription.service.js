const fs = require("fs");
const Groq = require("groq-sdk");
const Transcription = require("../models/transcription.model");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const path = require("path");

// Configure ffmpeg to use the static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

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
        await Transcription.findByIdAndUpdate(transcriptionId, { status: "processing" });

        // 2. Chunk the file — strategy depends on the input format
        const CHUNK_DURATION_S = 300; // 5-minute segments
        const ext = path.extname(filePath).toLowerCase();
        const isAudioOnly = COPY_SAFE_EXTS.has(ext);
        const chunkPattern = `${filePath}_chunk_%03d.mp3`;

        console.log(`[Transcription] Input: ${ext}, strategy: ${isAudioOnly ? "stream copy (no re-encode)" : "transcode (video → audio)"}`);
        const ffmpegStart = Date.now();

        await new Promise((resolve, reject) => {
            const cmd = ffmpeg(filePath);

            if (isAudioOnly) {
                // ── Fast path: copy the audio bitstream directly, no decoding/re-encoding.
                // This is nearly instantaneous (~1-3s) regardless of file size.
                cmd
                    .outputOptions([
                        "-c copy",               // copy stream, no re-encode
                        "-f segment",
                        `-segment_time ${CHUNK_DURATION_S}`,
                        "-map 0:a:0",            // ensure only audio track
                        "-reset_timestamps 1",
                    ])
                    .output(chunkPattern);
            } else {
                // ── Slow path: video file — extract + transcode audio to MP3.
                // Use fastest settings: 128kbps, mono, compression_level 0.
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
                .on("error", reject)
                .run();
        });

        console.log(`[Transcription] FFmpeg chunking: ${Math.round((Date.now() - ffmpegStart) / 1000)}s`);

        // Gather generated chunk filenames
        let chunkIndex = 0;
        while (fs.existsSync(`${filePath}_chunk_${String(chunkIndex).padStart(3, "0")}.mp3`)) {
            chunks.push(`${filePath}_chunk_${String(chunkIndex).padStart(3, "0")}.mp3`);
            chunkIndex++;
        }

        if (chunks.length === 0) {
            throw new Error("FFmpeg failed to generate audio chunks.");
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
        await Transcription.findByIdAndUpdate(transcriptionId, {
            transcript: fullTranscript.trim(),
            segments: fullSegments,
            duration: Math.round(totalDuration),
            status: "completed",
            processingTime,
        });

    } catch (error) {
        console.error("Transcription Job Error:", error.message);
        await Transcription.findByIdAndUpdate(transcriptionId, {
            status: "failed",
            errorMessage: error.message || "Failed to process audio file.",
        });
    } finally {
        // 5. Always clean up all temp files
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        chunks.forEach(chunkPath => {
            if (fs.existsSync(chunkPath)) fs.unlinkSync(chunkPath);
        });
    }
};

module.exports = { transcribeAudioJob };
