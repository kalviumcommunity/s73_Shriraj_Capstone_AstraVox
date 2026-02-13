const fetch = require('node-fetch'); // Assuming node-fetch is available or using built-in fetch in newer Node

async function testAutocomplete() {
    const url = 'http://localhost:5000/api/autocomplete';
    const data = { prompt: 'Write a tagline for a coffee shop' };

    try {
        console.log('Testing /api/autocomplete with prompt:', data.prompt);
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
        console.log('Success! Result:', result);
    } catch (error) {
        console.error('Request failed:', error);
    }
}

testAutocomplete();
