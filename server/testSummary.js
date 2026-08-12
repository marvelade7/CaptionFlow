require('dotenv').config();
const { generateSummaryAndExcerpt } = require('./services/aiSummary'); 

const sampleTranscript = `
Good morning, church. Today we're talking about faith in difficult seasons.
Life doesn't always go the way we plan, and when storms come, our faith is tested.
But I want to remind you today: faith isn't the absence of fear, it's moving forward despite it.
In the book of Matthew, Peter stepped out of the boat because Jesus called him.
He didn't sink because the wind was too strong. He sank when he took his eyes off Jesus and looked at the waves.
That's the lesson for us today. Keep your eyes on what God has promised, not on what the storm looks like.
When you feel like giving up, remember: God has never failed you before, and He is not starting now.
Let's stand and pray together as we close this message.
`.trim();

console.log('--- Sending test transcript to Gemini ---');
console.log(`Word count: ${sampleTranscript.split(/\s+/).length}`);

generateSummaryAndExcerpt(sampleTranscript)
    .then((result) => {
        console.log('\n--- SUCCESS ---');
        console.log('\nSummary:\n', result.summary);
        console.log('\nExcerpts:');
        result.excerpts.forEach((e, i) => console.log(`${i + 1}. ${e}`));
    })
    .catch((err) => {
        console.error('\n--- FAILED ---');
        console.error(err.message);
        console.error(err.stack);
    });