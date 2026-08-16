const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const getAnswer = require("./gemini");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edubridge';
const JWT_SECRET = process.env.JWT_SECRET || 'EDUBRIDGE_SECURE_TOKEN_SYSTEM_2026';

// Database Connectivity
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to Centralized MongoDB Instance'))
  .catch(err => console.error('MongoDB database connection error:', err));

// Database Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const TestScoreSchema = new mongoose.Schema({
  email: { type: String, required: true },
  subject: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});
const TestScore = mongoose.model('TestScore', TestScoreSchema);

// --- AUTHENTICATION ENDPOINTS ---

// Signup API
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Account already registered with this email.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server-side registration failure.' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials entered.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials entered.' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
    res.status(200).json({ message: 'Authentication successful', token, email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server login error.' });
  }
});

// --- PERFORMANCE STORAGE ENDPOINTS ---

// Save Score API
app.post('/api/scores', async (req, res) => {
  try {
    const { email, subject, score, totalQuestions } = req.body;
    const newScore = new TestScore({ email, subject, score, totalQuestions });
    await newScore.save();
    res.status(201).json({ message: 'Performance records committed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record tracking score.' });
  }
});

// Fetch Profile Scores API
app.get('/api/scores/:email', async (req, res) => {
  try {
    const scores = await TestScore.find({ email: req.params.email }).sort({ timestamp: -1 });
    res.status(200).json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving metrics records.' });
  }
});

// Base Route Fallback redirects users straight to loading splash
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'web.html'));
});

app.post("/api/doubt", async (req, res) => {
    try {
        const question = req.body.question;
        console.log("Question:", question);

        const answer = await getAnswer(question);

        console.log("Answer:", answer);

        res.json({ answer });
    } catch (error) {
    console.error(error);

    if (error.status === 503) {
        return res.json({
            answer: "⚠️ The AI service is busy right now. Please try again in a few minutes."
        });
    }

    res.json({
        answer: "Something went wrong. Please try again."
    });
}});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`EDUBRIDGE Server initialized on port ${PORT}`));