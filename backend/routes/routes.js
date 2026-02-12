const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview.js');
const User = require('../models/User.js');

// === USER ROUTES ===

// POST: Create a new user
router.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(400).json({ error: error.message });
  }
});

// GET: Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// === INTERVIEW ROUTES ===

// GET: Fetch all interview sessions
router.get('/interviews', async (req, res) => {
  try {
    const interviews = await Interview.find().populate('user');
    res.status(200).json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST: Save a new interview session
router.post('/interviews', async (req, res) => {
  try {
    const newInterview = new Interview(req.body);
    const savedInterview = await newInterview.save();
    res.status(201).json(savedInterview);
  } catch (error) {
    console.error("Error saving interview:", error);
    res.status(400).json({ error: error.message });
  }
});

// PUT: Update an interview session by ID
router.put('/interviews/:id', async (req, res) => {
  try {
    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedInterview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.status(200).json(updatedInterview);
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(400).json({ error: 'Bad Request' });
  }
});

module.exports = router;