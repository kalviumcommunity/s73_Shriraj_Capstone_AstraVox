const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    question: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['behavioral', 'technical', 'hr', 'general'],
        default: 'general'
    },
    type: {
        type: String,
        enum: ['text', 'audio', 'video'],
        default: 'text'
    },
    scores: {
        confidence: { type: Number, default: 0 },
        clarity: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        technical: { type: Number, default: 0 },
        overall: { type: Number, default: 0 }
    },
    strengths: [String],
    weaknesses: [String],
    tips: [String],
    fillerWords: { type: Number, default: 0 },
    speakingPace: { type: String, default: 'normal' },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Interview', interviewSchema);
