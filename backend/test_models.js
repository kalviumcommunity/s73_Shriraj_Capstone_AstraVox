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

        // Create an interview linked to the user
        const newInterview = new Interview({
            user: newUser._id,
            userName: newUser.username,
            position: 'Developer',
            responses: ['Answer 1', 'Answer 2'],
            score: 85,
            confidenceLevel: 'High',
            feedback: 'Good job'
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
