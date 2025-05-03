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


module.exports = router;