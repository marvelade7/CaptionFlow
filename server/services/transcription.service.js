const fs = require("fs");
const Groq = require("groq-sdk");
const Transcription = require("../models/transcription.model");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

// Configure ffmpeg to use the static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Transcribe an audio/video file using Groq's Whisper API in the background.
 * Uses FFmpeg to extract, compress, and chunk large files to bypass the 25MB limit.
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

        // 2. Extract, compress to 64kbps MP3, and split into 10-minute segments
        const chunkPattern = `${filePath}_chunk_%03d.mp3`;
        
        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .audioCodec('libmp3lame')
                .audioBitrate('64k')
                .audioChannels(1)
                .outputOptions([
                    '-f segment',
                    '-segment_time 600', // 10 minutes per chunk
                ])
                .output(chunkPattern)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // Gather generated chunk filenames
        let chunkIndex = 0;
        while (fs.existsSync(`${filePath}_chunk_${String(chunkIndex).padStart(3, '0')}.mp3`)) {
            chunks.push(`${filePath}_chunk_${String(chunkIndex).padStart(3, '0')}.mp3`);
            chunkIndex++;
        }

        if (chunks.length === 0) {
            throw new Error("FFmpeg failed to generate audio chunks.");
        }

        // 3. Process each chunk sequentially
        let fullTranscript = "";
        let fullSegments = [];
        let totalDuration = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunkPath = chunks[i];
            
            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(chunkPath),
                model: "whisper-large-v3",
                response_format: "verbose_json",
                language: "en",
                temperature: 0.0,
            });

            // Stitch text
            fullTranscript += (fullTranscript ? " " : "") + transcription.text;
            
            // Stitch segments with time offset (10 minutes = 600 seconds per chunk)
            const timeOffset = i * 600;
            if (transcription.segments) {
                transcription.segments.forEach(segment => {
                    fullSegments.push({
                        start: segment.start + timeOffset,
                        end: segment.end + timeOffset,
                        text: segment.text
                    });
                });
            }
            
            // For the last chunk, we add its exact duration to the total.
            // For preceding chunks, we add exactly 600s since they were perfectly split.
            if (i === chunks.length - 1) {
                totalDuration += (transcription.duration || 0);
            } else {
                totalDuration += 600;
            }
        }

        const processingTime = Math.round((Date.now() - startTime) / 1000);

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
        // Update DB with failure
        await Transcription.findByIdAndUpdate(transcriptionId, {
            status: "failed",
            errorMessage: error.message || "Failed to process audio file.",
        });
    } finally {
        // 5. Always clean up all files!
        // Delete original file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        // Delete all chunks
        chunks.forEach(chunkPath => {
            if (fs.existsSync(chunkPath)) {
                fs.unlinkSync(chunkPath);
            }
        });
    }
};

module.exports = { transcribeAudioJob };
