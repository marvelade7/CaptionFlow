const fs = require("fs");
const Groq = require("groq-sdk");
const Transcription = require("../models/transcription.model");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'your_groq_api_key_here',
});

/**
 * Transcribe an audio file using Groq's Whisper API in the background.
 * @param {string} filePath - The local path to the audio file.
 * @param {string} transcriptionId - The ID of the transcription record to update.
 */
const transcribeAudioJob = async (filePath, transcriptionId) => {
    const startTime = Date.now();
    try {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            throw new Error("GROQ_API_KEY is not configured. Please add it to your .env file.");
        }

        // Update status to processing
        await Transcription.findByIdAndUpdate(transcriptionId, { status: "processing" });

        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-large-v3",
            response_format: "json",
            language: "en", // Defaulting to english for now
            temperature: 0.0,
        });

        const processingTime = Math.round((Date.now() - startTime) / 1000);

        // Update with success
        await Transcription.findByIdAndUpdate(transcriptionId, {
            transcript: transcription.text,
            status: "completed",
            processingTime,
        });

    } catch (error) {
        console.error("Groq Transcription Error:", error.message);
        // Update with failure
        await Transcription.findByIdAndUpdate(transcriptionId, {
            status: "failed",
            errorMessage: error.message || "Failed to transcribe audio with Groq.",
        });
    } finally {
        // Always clean up the temporary file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

module.exports = { transcribeAudioJob };
