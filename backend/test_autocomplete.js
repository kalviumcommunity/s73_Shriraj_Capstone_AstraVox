const fetch = require('node-fetch');

async function testAnalyze() {
    const url = 'http://localhost:5000/api/analyze';
    const data = {
        question: 'Tell me about a time you overcame a difficult challenge',
        response: 'In my previous role as a software developer, I was tasked with leading the migration of our legacy monolith to a microservices architecture. The situation was complex because the system had years of technical debt. I analyzed the codebase, identified the key components, and created a phased migration plan. I collaborated with the team to implement the changes over three months. As a result, we reduced deployment time by 60% and improved system reliability significantly.',
        category: 'behavioral'
    };

    try {
        console.log('Testing /api/analyze with question:', data.question);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error('Error:', response.status, response.statusText);
            const text = await response.text();
            console.error('Body:', text);
            return;
        }

        const result = await response.json();
        console.log('Success!');
        console.log('Scores:', result.scores);
        console.log('Strengths:', result.strengths);
        console.log('Weaknesses:', result.weaknesses);
        console.log('Tips:', result.tips);
        console.log('Filler Words:', result.fillerWords);
        console.log('Speaking Pace:', result.speakingPace);
    } catch (error) {
        console.error('Request failed:', error.message);
        console.error('Make sure the server is running: node server.js');
    }
}

testAnalyze();
