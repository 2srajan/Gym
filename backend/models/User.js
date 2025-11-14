const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number']
  },
  join_date: {
    type: Date,
    default: Date.now
  },
  subscription_tier: {
    type: String,
    enum: ['basic', 'premium', 'elite', 'none'],
    default: 'none'
  },
  subscription_status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'none'],
    default: 'none'
  },
  subscription_end_date: {
    type: Date
  },
  profile_info: {
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age must be less than 120']
    },
    weight: {
      type: Number,
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight must be less than 500 kg']
    },
    height: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [300, 'Height must be less than 300 cm']
    },
    fitness_goals: [{
      type: String,
      trim: true
    }],
    emergency_contact: {
      name: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      relationship: {
        type: String,
        trim: true
      }
    }
  },
  paypal_customer_id: {
    type: String,
    trim: true
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  email_verification_token: {
    type: String,
    trim: true
  },
  password_reset_token: {
    type: String,
    trim: true
  },
  password_reset_expires: {
    type: Date
  },
  last_login: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password_hash;
  delete userObject.email_verification_token;
  delete userObject.password_reset_token;
  delete userObject.password_reset_expires;
  return userObject;
};

userSchema.virtual('is_premium').get(function() {
  return ['premium', 'elite'].includes(this.subscription_tier);
});

userSchema.virtual('has_active_subscription').get(function() {
  return this.subscription_status === 'active' &&
         this.subscription_end_date &&
         this.subscription_end_date > new Date();
});

userSchema.index({ email: 1 });
userSchema.index({ subscription_status: 1 });
userSchema.index({ created_at: -1 });

module.exports = mongoose.model('User', userSchema);