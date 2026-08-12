const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function getSummaryInstruction(transcriptText) {
    const wordCount = transcriptText.trim().split(/\s+/).length;

    if (wordCount < 1500) {
        return 'Write a concise summary in 4-6 sentences covering the main message and key points.';
    } else if (wordCount < 6000) {
        return 'Write a summary in 2-3 short paragraphs, covering the main message, key points or scripture references, and any call to action.';
    } else {
        return 'Write a thorough summary in 4-6 paragraphs. Cover the overall message/theme, each major point or scripture passage discussed in the order presented, key stories or illustrations used, and any closing call to action. Give each major point its own sentence or two rather than compressing them together.';
    }
}

function generateSummaryAndExcerpt(transcriptText) {
    const summaryInstruction = getSummaryInstruction(transcriptText);

    const prompt = `You are given a sermon transcript. Return ONLY a JSON object, no preamble, no markdown fences, in this exact shape:
{
    "summary": "the summary text",
    "excerpts": ["excerpt 1", "excerpt 2", "..."]
}

Summary instructions:
${summaryInstruction}

Excerpt rules:
- Return 5 to 12 excerpts.
- You must return at least 5 excerpts when the transcript contains at least 5 genuinely strong, quotable moments.
- Never invent, paraphrase, combine, or alter excerpts just to reach the minimum.
- Identify the most quotable, powerful, or shareable moments in the transcript — lines that would work well as standalone slides or social clips.
- Each excerpt should be 1-3 sentences, copied verbatim from the transcript (do not paraphrase).
- Order them by their position in the transcript.

Transcript:
"""
${transcriptText}
"""`;

    return ai.models
        .generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                maxOutputTokens: 8192, // roomier ceiling to absorb thinking + long summary + 12 excerpts
                thinkingConfig: {
                    thinkingLevel: 'minimal', // 
                },
            },
        })
        .then((response) => {
            const parsed = JSON.parse(response.text);
            if (!parsed.summary || !Array.isArray(parsed.excerpts) || parsed.excerpts.length === 0) {
                throw new Error('AI response missing summary or excerpts array');
            }
            return parsed;
        });
}

module.exports = { generateSummaryAndExcerpt };