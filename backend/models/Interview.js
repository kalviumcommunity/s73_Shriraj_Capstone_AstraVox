const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    position: String,
    responses: [String],
    score: Number,
    confidenceLevel: String,
    feedback: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interview', InterviewSchema);
