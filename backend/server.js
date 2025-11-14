require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');
const workoutRoutes = require('./api/workouts');
const exerciseRoutes = require('./api/exercises');
const subscriptionRoutes = require('./api/subscriptions');
const facilityRoutes = require('./api/facilities');
const reminderRoutes = require('./api/reminders');
const todoRoutes = require('./api/todos');
const rulesRoutes = require('./api/rules');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gymdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/rules', rulesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gym API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});