const express = require('express');
const path = require('path');
const cors = require('cors');

// Try MongoDB connection - app works without it
let mongooseConnected = false;
try {
  const mongoose = require('mongoose');
  require('dotenv').config();

  if (process.env.MONGO_URL) {
    mongoose.connect(process.env.MONGO_URL)
      .then(() => {
        console.log('MongoDB connected');
        mongooseConnected = true;
      })
      .catch(err => console.log('MongoDB not available, using localStorage mode'));
  } else {
    console.log('No MONGO_URL set, running in localStorage-only mode');
  }
} catch (e) {
  console.log('Running without MongoDB');
}

const routes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', routes);

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Root goes to dashboard
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.listen(PORT, () => {
  console.log(`AstraVox server running on http://localhost:${PORT}`);
});
