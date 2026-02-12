const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: String, // Keeping for backward compatibility or denormalization if needed
    position: String,
    responses: [String],
    audioUrl: String, // URL to the audio file if applicable
    transcript: String, // Text transcript of the interview
    score: Number,
    confidenceLevel: String,
    feedback: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interview', InterviewSchema);
