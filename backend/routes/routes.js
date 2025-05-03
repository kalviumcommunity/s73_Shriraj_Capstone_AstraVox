const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');

// GET: Fetch all interviews
router.get('/interviews', async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST: Save new interview
router.post('/interviews', async (req, res) => {
  console.log('POST request received:', req.body);
  try {
    const newInterview = new Interview(req.body);
    const savedInterview = await newInterview.save();
    res.status(201).json(savedInterview);
  } catch (error) {
    console.error('Error saving interview:', error);
    res.status(400).json({ error: 'Bad Request' });
  }
});

module.exports = router;
