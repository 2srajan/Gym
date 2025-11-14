const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true,
    maxlength: [100, 'Exercise name cannot exceed 100 characters']
  },
  sets: {
    type: Number,
    required: [true, 'Number of sets is required'],
    min: [1, 'Must have at least 1 set'],
    max: [100, 'Cannot exceed 100 sets']
  },
  reps: {
    type: Number,
    required: [true, 'Number of reps is required'],
    min: [1, 'Must have at least 1 rep'],
    max: [500, 'Cannot exceed 500 reps']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    max: [1000, 'Weight cannot exceed 1000 kg']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Exercise notes cannot exceed 500 characters']
  }
});

const workoutSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Workout date is required'],
    default: Date.now,
    index: true
  },
  duration: {
    type: Number,
    required: [true, 'Workout duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [480, 'Duration cannot exceed 480 minutes (8 hours)']
  },
  exercises: {
    type: [exerciseSchema],
    required: [true, 'At least one exercise is required'],
    validate: {
      validator: function(exercises) {
        return exercises.length > 0;
      },
      message: 'Workout must contain at least one exercise'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Workout notes cannot exceed 1000 characters']
  },
  calories_burned: {
    type: Number,
    min: [0, 'Calories burned cannot be negative'],
    max: [5000, 'Calories burned cannot exceed 5000']
  },
  workout_type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'mixed', 'sports'],
    default: 'mixed'
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very_high'],
    default: 'moderate'
  },
  completed: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

workoutSchema.virtual('total_sets').get(function() {
  return this.exercises.reduce((total, exercise) => total + exercise.sets, 0);
});

workoutSchema.virtual('total_reps').get(function() {
  return this.exercises.reduce((total, exercise) => total + exercise.reps, 0);
});

workoutSchema.virtual('total_volume').get(function() {
  return this.exercises.reduce((total, exercise) => {
    return total + (exercise.weight * exercise.reps * exercise.sets);
  }, 0);
});

workoutSchema.index({ user_id: 1, date: -1 });
workoutSchema.index({ user_id: 1, workout_type: 1 });
workoutSchema.index({ date: -1 });

module.exports = mongoose.model('Workout', workoutSchema);