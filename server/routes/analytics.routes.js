const express = require("express");
const { trackVisit } = require("../services/visitor.service");

const router = express.Router();

router.post("/visit", (req, res) => {
    const { sessionId, page } = req.body;
    
    if (!sessionId || !page) {
        return res.status(400).json({ success: false });
    }

    trackVisit(sessionId, page, req)
        .then(() => {
            res.status(200).json({ success: true });
        })
        .catch(() => {
            // Silently fail for client
            res.status(200).json({ success: true });
        });
});

module.exports = router;
