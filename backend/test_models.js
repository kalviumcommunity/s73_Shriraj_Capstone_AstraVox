const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Interview = require('./models/Interview');

async function testModels() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB Connected');

        // Create a user
        const newUser = new User({
            username: 'testuser_' + Date.now(),
            email: 'test_' + Date.now() + '@example.com',
            password: 'password123'
        });
        await newUser.save();
        console.log('User created:', newUser._id);

        // Create an interview linked to the user (matching current schema)
        const newInterview = new Interview({
            user: newUser._id,
            question: 'Tell me about a time you overcame a difficult challenge',
            response: 'In my previous role, I was tasked with migrating our legacy system to a new platform. I analyzed the existing codebase, created a migration plan, and led the team through the process. As a result, we improved performance by 40%.',
            category: 'behavioral',
            type: 'text',
            scores: {
                confidence: 75,
                clarity: 80,
                communication: 72,
                technical: 65,
                overall: 73
            },
            strengths: ['Good use of STAR method', 'Quantifiable results mentioned'],
            weaknesses: ['Could add more technical detail'],
            tips: ['Practice expanding on technical aspects'],
            fillerWords: 0,
            speakingPace: 'normal'
        });
        await newInterview.save();
        console.log('Interview created:', newInterview._id);

        // Fetch interview and populate user
        const fetchedInterview = await Interview.findById(newInterview._id).populate('user');
        console.log('Fetched Interview User:', fetchedInterview.user.username);

        if (fetchedInterview.user.username === newUser.username) {
            console.log('Verification SUCCESS!');
        } else {
            console.log('Verification FAILED: User mismatch');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testModels();
