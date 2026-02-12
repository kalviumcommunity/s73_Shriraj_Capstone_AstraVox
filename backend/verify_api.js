const http = require('http');

async function testApi() {
    const baseUrl = 'http://localhost:3000/api';

    // 1. Create User
    const userData = {
        username: 'api_user_' + Date.now(),
        email: 'api_' + Date.now() + '@test.com',
        password: 'securepassword'
    };

    console.log('Creating User...');
    const userRes = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (!userRes.ok) {
        console.error('Failed to create user:', await userRes.text());
        return;
    }
    const user = await userRes.json();
    console.log('User created:', user._id);

    // 2. Create Interview
    const interviewData = {
        user: user._id,
        userName: user.username,
        position: 'Backend Dev',
        responses: ['API works'],
        score: 95,
        confidenceLevel: 'High',
        feedback: 'Excellent'
    };

    console.log('Creating Interview...');
    const interviewRes = await fetch(`${baseUrl}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
    });

    if (!interviewRes.ok) {
        console.error('Failed to create interview:', await interviewRes.text());
        return;
    }
    const interview = await interviewRes.json();
    console.log('Interview created:', interview._id);

    // 3. Read Interviews
    console.log('Fetching Interviews...');
    const getRes = await fetch(`${baseUrl}/interviews`);
    const interviews = await getRes.json();
    console.log(`Found ${interviews.length} interviews`);

    const ourInterview = interviews.find(i => i._id === interview._id);
    if (ourInterview && ourInterview.user && ourInterview.user.username === userData.username) {
        console.log('VERIFICATION SUCCESS: Data read/write verified via API');
    } else {
        console.log('VERIFICATION FAILED: Could not verify data integrity');
    }
}

// Wait a bit for server to start if running concurrently, but here we run it manually
setTimeout(testApi, 2000);
