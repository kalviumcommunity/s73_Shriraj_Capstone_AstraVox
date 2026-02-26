const express = require('express');
const router = express.Router();

// Try to load models - they need MongoDB to work
const mongoose = require('mongoose');
let Interview, User;
try {
  Interview = require('../models/Interview.js');
  User = require('../models/User.js');
} catch (e) {
  console.log('Models not loaded (MongoDB might not be connected)');
}

const isDbConnected = () => mongoose.connection.readyState === 1;

// === USER ROUTES ===

router.post('/users', async (req, res) => {
  try {
    if (!User || !isDbConnected()) return res.status(503).json({ error: 'Database not available' });
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    if (!User || !isDbConnected()) return res.status(503).json({ error: 'Database not available' });
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// === INTERVIEW ROUTES ===

router.get('/interviews', async (req, res) => {
  try {
    if (!Interview || !isDbConnected()) return res.status(200).json([]);
    const interviews = await Interview.find().sort({ createdAt: -1 });
    res.status(200).json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/interviews/:id', async (req, res) => {
  try {
    if (!Interview || !isDbConnected()) return res.status(404).json({ error: 'Database not available' });
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/interviews', async (req, res) => {
  try {
    if (!Interview || !isDbConnected()) return res.status(503).json({ error: 'Database not available' });
    const newInterview = new Interview(req.body);
    const savedInterview = await newInterview.save();
    res.status(201).json(savedInterview);
  } catch (error) {
    console.error("Error saving interview:", error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/interviews/:id', async (req, res) => {
  try {
    if (!Interview || !isDbConnected()) return res.status(503).json({ error: 'Database not available' });
    const updated = await Interview.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Interview not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request' });
  }
});

router.delete('/interviews/:id', async (req, res) => {
  try {
    if (!Interview || !isDbConnected()) return res.status(503).json({ error: 'Database not available' });
    const deleted = await Interview.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Interview not found' });
    res.status(200).json({ message: 'Interview deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// === AI ANALYSIS ROUTE ===

const { analyzeInterview } = require('../analyzer.js');

router.post('/analyze', (req, res) => {
  try {
    const { question, response, category } = req.body;

    if (!question || !response) {
      return res.status(400).json({ error: 'Question and response are required' });
    }

    const analysis = analyzeInterview(question, response, category || 'general');
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing response:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// === ANALYTICS ROUTE ===

router.get('/analytics', async (req, res) => {
  try {
    if (!Interview || !isDbConnected()) {
      return res.status(200).json({
        totalInterviews: 0,
        avgScores: { confidence: 0, clarity: 0, communication: 0, technical: 0, overall: 0 },
        categoryBreakdown: {}
      });
    }

    const interviews = await Interview.find();
    const total = interviews.length;

    if (total === 0) {
      return res.status(200).json({
        totalInterviews: 0,
        avgScores: { confidence: 0, clarity: 0, communication: 0, technical: 0, overall: 0 },
        categoryBreakdown: {}
      });
    }

    // Calculate averages
    const avgScores = {
      confidence: Math.round(interviews.reduce((s, i) => s + (i.scores?.confidence || 0), 0) / total),
      clarity: Math.round(interviews.reduce((s, i) => s + (i.scores?.clarity || 0), 0) / total),
      communication: Math.round(interviews.reduce((s, i) => s + (i.scores?.communication || 0), 0) / total),
      technical: Math.round(interviews.reduce((s, i) => s + (i.scores?.technical || 0), 0) / total),
      overall: Math.round(interviews.reduce((s, i) => s + (i.scores?.overall || 0), 0) / total)
    };

    // Category breakdown
    const categoryBreakdown = {};
    interviews.forEach(i => {
      const cat = i.category || 'general';
      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { count: 0, totalScore: 0 };
      categoryBreakdown[cat].count++;
      categoryBreakdown[cat].totalScore += i.scores?.overall || 0;
    });

    Object.keys(categoryBreakdown).forEach(cat => {
      categoryBreakdown[cat].avgScore = Math.round(
        categoryBreakdown[cat].totalScore / categoryBreakdown[cat].count
      );
    });

    res.status(200).json({ totalInterviews: total, avgScores, categoryBreakdown });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;