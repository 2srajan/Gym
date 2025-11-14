const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Exercise name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Exercise category is required'],
    enum: ['cardio', 'strength', 'flexibility', 'balance', 'sports', 'functional'],
    index: true
  },
  muscle_groups: [{
    type: String,
    required: true,
    enum: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'quadriceps', 'hamstrings', 'glutes', 'calves', 'core', 'abs',
      'full_body', 'other'
    ],
    index: true
  }],
  equipment_needed: [{
    type: String,
    enum: [
      'none', 'dumbbells', 'barbell', 'kettlebells', 'cable_machine',
      'resistance_bands', 'treadmill', 'stationary_bike', 'elliptical',
      'rowing_machine', 'pull_up_bar', 'dip_bars', 'medicine_ball',
      'foam_roller', 'yoga_mat', 'benches', 'smith_machine',
      'leg_press', 'hack_squat', 'calf_raise', 'lat_pulldown',
      'cable_crossover', 'leg_curl', 'leg_extension', 'other'
    ],
    index: true
  }],
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
    index: true
  },
  instructions: {
    type: String,
    required: [true, 'Exercise instructions are required'],
    trim: true,
    maxlength: [2000, 'Instructions cannot exceed 2000 characters']
  },
  tips: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each tip cannot exceed 200 characters']
  }],
  images: [{
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      },
      message: 'Please provide valid image URLs'
    }
  }],
  videos: [{
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        return /^https?:\/\/.+\.(mp4|mov|avi|webm)$/i.test(url) ||
               /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url);
      },
      message: 'Please provide valid video URLs'
    }
  }],
  calories_per_minute: {
    type: Number,
    min: [0, 'Calories per minute cannot be negative'],
    max: [50, 'Calories per minute seems unrealistic']
  },
  estimated_duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute'],
    max: [180, 'Duration cannot exceed 180 minutes']
  },
  variations: [{
    type: String,
    trim: true,
    maxlength: [100, 'Variation name cannot exceed 100 characters']
  }],
  common_mistakes: [{
    type: String,
    trim: true,
    maxlength: [200, 'Common mistake cannot exceed 200 characters']
  }],
  safety_notes: [{
    type: String,
    trim: true,
    maxlength: [300, 'Safety note cannot exceed 300 characters']
  }],
  target_reps_min: {
    type: Number,
    min: [1, 'Minimum reps must be at least 1']
  },
  target_reps_max: {
    type: Number,
    min: [1, 'Maximum reps must be at least 1']
  },
  target_sets_min: {
    type: Number,
    min: [1, 'Minimum sets must be at least 1']
  },
  target_sets_max: {
    type: Number,
    min: [1, 'Maximum sets must be at least 1']
  },
  rest_time_seconds: {
    type: Number,
    min: [10, 'Rest time must be at least 10 seconds'],
    max: [600, 'Rest time cannot exceed 10 minutes']
  },
  popular: {
    type: Boolean,
    default: false,
    index: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  rating_count: {
    type: Number,
    default: 0,
    min: [0, 'Rating count cannot be negative']
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

exerciseSchema.virtual('display_name').get(function() {
  return this.name.charAt(0).toUpperCase() + this.name.slice(1);
});

exerciseSchema.virtual('equipment_display').get(function() {
  if (this.equipment_needed.length === 0) return 'No equipment needed';
  if (this.equipment_needed.includes('none')) return 'No equipment needed';
  return this.equipment_needed.join(', ').replace(/_/g, ' ');
});

exerciseSchema.index({ name: 'text', instructions: 'text' });
exerciseSchema.index({ category: 1, difficulty: 1 });
exerciseSchema.index({ muscle_groups: 1 });
exerciseSchema.index({ popular: -1, rating: -1 });

exerciseSchema.pre('save', function(next) {
  if (this.target_reps_max && this.target_reps_min && this.target_reps_max < this.target_reps_min) {
    return next(new Error('Maximum reps cannot be less than minimum reps'));
  }
  if (this.target_sets_max && this.target_sets_min && this.target_sets_max < this.target_sets_min) {
    return next(new Error('Maximum sets cannot be less than minimum sets'));
  }
  next();
});

module.exports = mongoose.model('Exercise', exerciseSchema);