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
Key Point / Excerpt Rules:

KEY POINT RULES:

- Identify the most important teachings, lessons, principles, warnings, and insights from the sermon.
- These are KEY POINTS, not quotations.
- Distill each key point into a concise statement that captures what the preacher was teaching.
- Do not simply copy large portions of the transcript.
- You may paraphrase the preacher's explanation to make the key point concise and clear.
- Preserve the preacher's intended meaning. Do not introduce ideas that were not taught.
- Each key point should communicate ONE main idea.
- Keep each key point concise, normally 1-2 sentences and preferably under 40 words.
- If the preacher spends several sentences explaining the same idea, combine that explanation into one concise key point.
- Prioritize the central teachings of the sermon over minor observations or introductory explanations.
- Do not select definitions, greetings, transitions, repeated statements, or conversational filler unless they contain an important teaching.
- Do not use Bible verses or direct scripture quotations as key points.
- When a scripture is discussed, capture the lesson the preacher draws from the scripture rather than repeating the scripture.
- Do not use prayers, declarations, blessings, or prophetic statements as key points.
- Do not select a statement merely because it sounds inspirational or would make a good social-media quote.
- Avoid duplicate or overlapping key points.
- Order the key points according to the progression of the sermon.

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