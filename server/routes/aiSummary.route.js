const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware'); 

const {
    generateSummary,
    downloadSummary,
    downloadExcerpts,
} = require('../controllers/aiSummary.controller');

router.post('/:jobId/generate-summary', authMiddleware, generateSummary);
router.get('/:jobId/download/summary', authMiddleware, downloadSummary);
router.get('/:jobId/download/excerpts', authMiddleware, downloadExcerpts);

module.exports = router;