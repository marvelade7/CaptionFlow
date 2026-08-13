const Transcription = require('../models/transcription.model');
const { generateSummaryAndExcerpt } = require('../services/aiSummary');
const DownloadHistory = require("../models/downloadHistory.model");
const { logActivity } = require("../services/activity.service");

function generateSummary(req, res) {
    const { jobId } = req.params;

    Transcription.findById(jobId)
        .then((job) => {
            if (!job) {
                res.status(404).json({ message: 'Job not found' });
                return null;
            }
            if (job.userId.toString() !== req.user.id.toString()) {
                res.status(403).json({ message: 'Not authorized for this job' });
                return null;
            }
            if (!job.transcript) {
                res.status(400).json({ message: 'Job has no transcript to summarize yet' });
                return null;
            }

            job.aiProcessingStatus = 'processing';
            return job.save();
        })
        .then((job) => {
            if (!job) return;

            return generateSummaryAndExcerpt(job.transcript)
                .then(({ summary, excerpts }) => {
                    job.summary = { text: summary, generatedAt: new Date() };
                    job.excerpts = { items: excerpts, generatedAt: new Date() };
                    job.aiProcessingStatus = 'completed';
                    return job.save();
                })
                .then((savedJob) => {
                    res.status(200).json({
                        summary: savedJob.summary,
                        excerpts: savedJob.excerpts,
                    });
                })
                .catch((err) => {
                    job.aiProcessingStatus = 'failed';
                    return job.save().then(() => {
                        console.error('AI summary generation failed:', err.message);
                        res.status(500).json({ message: 'Failed to generate summary and excerpts' });
                    });
                });
        })
        .catch((err) => {
            console.error('generateSummary error:', err.message);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Server error' });
            }
        });
}

function downloadSummary(req, res) {
    const { jobId } = req.params;

    Transcription.findById(jobId)
        .then((job) => {
            if (!job) return res.status(404).json({ message: 'Job not found' });
            if (job.userId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (!job.summary?.text) {
                return res.status(400).json({ message: 'No summary generated yet' });
            }

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="summary-${jobId}.txt"`);
            res.send(job.summary.text);
            
            // Track download
            DownloadHistory.create({
                user: req.user.id,
                transcription: jobId,
                format: "summary",
                ipAddress: req.ip || req.connection.remoteAddress || "",
                userAgent: req.headers["user-agent"] || "",
            }).catch(() => {});
            logActivity("FILE_DOWNLOADED", req.user.id, { format: "summary", transcriptionId: jobId }, req);
        })
        .catch((err) => {
            console.error('downloadSummary error:', err.message);
            res.status(500).json({ message: 'Server error' });
        });
}

function downloadExcerpts(req, res) {
    const { jobId } = req.params;

    Transcription.findById(jobId)
        .then((job) => {
            if (!job) return res.status(404).json({ message: 'Job not found' });
            if (job.userId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (!job.excerpts?.items?.length) {
                return res.status(400).json({ message: 'No excerpts generated yet' });
            }

            const formatted = job.excerpts.items
                .map((text, i) => `${i + 1}. ${text}`)
                .join('\n\n');

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="excerpts-${jobId}.txt"`);
            res.send(formatted);
            
            // Track download
            DownloadHistory.create({
                user: req.user.id,
                transcription: jobId,
                format: "excerpts",
                ipAddress: req.ip || req.connection.remoteAddress || "",
                userAgent: req.headers["user-agent"] || "",
            }).catch(() => {});
            logActivity("FILE_DOWNLOADED", req.user.id, { format: "excerpts", transcriptionId: jobId }, req);
        })
        .catch((err) => {
            console.error('downloadExcerpts error:', err.message);
            res.status(500).json({ message: 'Server error' });
        });
}

module.exports = { generateSummary, downloadSummary, downloadExcerpts };