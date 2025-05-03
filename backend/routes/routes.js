const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview.js');

// GET: Fetch all interview sessions
router.get('/api/interviews', async (req, res) => {
    try {
        const interviews = await Interview.find();
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST: Save a new interview session
router.post('/api/interviews', async (req, res) => {
    console.log("POST request received:", req.body);
    try {
        const newInterview = new Interview(req.body); // create new document
        const savedInterview = await newInterview.save(); // save to MongoDB
        res.status(201).json(savedInterview); // return the saved doc
    } catch (error) {
        console.error("Error saving interview:", error);
        res.status(400).json({ error: 'Bad Request' });
    }
});

// PUT: Update an interview session by ID
router.put('/interviews/:id', async (req, res) => {
    try {
      const updatedInterview = await Interview.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // return the updated document
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