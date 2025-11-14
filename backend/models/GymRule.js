const mongoose = require('mongoose');

const gymRuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Rule title is required'],
    trim: true,
    maxlength: [200, 'Rule title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Rule description is required'],
    trim: true,
    maxlength: [2000, 'Rule description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Rule category is required'],
    enum: ['safety', 'etiquette', 'equipment', 'general', 'hygiene', 'access', 'emergency'],
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  importance: {
    type: Number,
    default: 5,
    min: [1, 'Importance must be at least 1'],
    max: [10, 'Importance cannot exceed 10'],
    index: true
  },
  display_order: {
    type: Number,
    default: 0,
    min: [0, 'Display order cannot be negative']
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  facility_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    index: true
  },
  applies_to: {
    type: String,
    enum: ['all', 'members_only', 'staff_only', 'guests', 'specific_tiers'],
    default: 'all'
  },
  applicable_tiers: [{
    type: String,
    enum: ['basic', 'premium', 'elite']
  }],
  rule_type: {
    type: String,
    enum: ['guideline', 'prohibition', 'requirement', 'recommendation', 'warning'],
    default: 'guideline'
  },
  consequences: [{
    type: String,
    trim: true,
    maxlength: [300, 'Consequence cannot exceed 300 characters']
  }],
  exceptions: [{
    condition: {
      type: String,
      trim: true,
      maxlength: [200, 'Exception condition cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Exception description cannot exceed 300 characters']
    },
    requires_approval: {
      type: Boolean,
      default: false
    }
  }],
  related_equipment: [{
    type: String,
    trim: true,
    maxlength: [100, 'Related equipment cannot exceed 100 characters']
  }],
  related_areas: [{
    type: String,
    trim: true,
    maxlength: [100, 'Related area cannot exceed 100 characters']
  }],
  time_restrictions: {
    applicable: {
      type: Boolean,
      default: false
    },
    days_of_week: [{
      type: Number,
      min: [0, 'Day must be between 0 (Sunday) and 6 (Saturday)'],
      max: [6, 'Day must be between 0 (Sunday) and 6 (Saturday)']
    }],
    start_time: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    },
    end_time: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    }
  },
  age_restrictions: {
    applicable: {
      type: Boolean,
      default: false
    },
    min_age: {
      type: Number,
      min: [0, 'Minimum age cannot be negative'],
      max: [120, 'Minimum age cannot exceed 120']
    },
    max_age: {
      type: Number,
      min: [0, 'Maximum age cannot be negative'],
      max: [120, 'Maximum age cannot exceed 120']
    }
  },
  certification_required: {
    type: Boolean,
    default: false
  },
  certifications_needed: [{
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Certification name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Certification description cannot exceed 300 characters']
    }
  }],
  supervisory_requirements: {
    requires_supervisor: {
      type: Boolean,
      default: false
    },
    supervisor_type: {
      type: String,
      enum: ['trainer', 'staff', 'lifeguard', 'manager', 'medical']
    },
    minimum_supervisors: {
      type: Number,
      min: [1, 'Minimum supervisors must be at least 1'],
      max: [10, 'Minimum supervisors cannot exceed 10']
    }
  },
  documentation: {
    images: [{
      url: {
        type: String,
        trim: true,
        validate: {
          validator: function(url) {
            return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
          },
          message: 'Please provide a valid image URL'
        }
      },
      caption: {
        type: String,
        trim: true,
        maxlength: [200, 'Image caption cannot exceed 200 characters']
      }
    }],
    videos: [{
      url: {
        type: String,
        trim: true,
        validate: {
          validator: function(url) {
            return /^https?:\/\/.+\.(mp4|mov|avi|webm)$/i.test(url) ||
                   /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url);
          },
          message: 'Please provide a valid video URL'
        }
      },
      title: {
        type: String,
        trim: true,
        maxlength: [200, 'Video title cannot exceed 200 characters']
      }
    }],
    documents: [{
      title: {
        type: String,
        trim: true,
        maxlength: [200, 'Document title cannot exceed 200 characters']
      },
      url: {
        type: String,
        trim: true,
        validate: {
          validator: function(url) {
            return /^https?:\/\/.+\.(pdf|doc|docx)$/i.test(url);
          },
          message: 'Please provide a valid document URL'
        }
      }
    }]
  },
  enforcement: {
    method: {
      type: String,
      enum: ['staff_monitoring', 'automated', 'self_reporting', 'member_reports'],
      default: 'staff_monitoring'
    },
    reporting_mechanism: {
      type: String,
      enum: ['app_report', 'front_desk', 'hotline', 'email', 'in_person']
    },
    response_time_minutes: {
      type: Number,
      min: [1, 'Response time must be at least 1 minute'],
      max: [1440, 'Response time cannot exceed 24 hours']
    }
  },
  compliance_tracking: {
    tracked: {
      type: Boolean,
      default: false
    },
    metrics_collected: [{
      type: String,
      enum: ['violations', 'warnings', 'compliance_rate', 'user_reports']
    }],
    reporting_frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly']
    }
  },
  multilingual_content: {
    language: {
      type: String,
      default: 'en'
    },
    translations: [{
      language: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Translated title cannot exceed 200 characters']
      },
      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [2000, 'Translated description cannot exceed 2000 characters']
      }
    }]
  },
  accessibility_features: {
    ada_compliant: {
      type: Boolean,
      default: true
    },
    large_print_available: {
      type: Boolean,
      default: false
    },
    audio_version_available: {
      type: Boolean,
      default: false
    },
    braille_version_available: {
      type: Boolean,
      default: false
    }
  },
  emergency_procedures: {
    related: {
      type: Boolean,
      default: false
    },
    emergency_type: {
      type: String,
      enum: ['fire', 'medical', 'security', 'equipment_failure', 'power_outage', 'weather']
    },
    immediate_action: {
      type: String,
      trim: true,
      maxlength: [300, 'Immediate action cannot exceed 300 characters']
    }
  },
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  approval_status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'approved'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approval_date: {
    type: Date
  },
  review_date: {
    type: Date,
    default: Date.now
  },
  next_review_date: {
    type: Date,
    default: function() {
      const nextReview = new Date();
      nextReview.setFullYear(nextReview.getFullYear() + 1);
      return nextReview;
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updated_at: 'updated_at' }
});

gymRuleSchema.virtual('is_time_restricted').get(function() {
  return this.time_restrictions.applicable &&
         this.time_restrictions.days_of_week.length > 0 &&
         this.time_restrictions.start_time &&
         this.time_restrictions.end_time;
});

gymRuleSchema.virtual('is_age_restricted').get(function() {
  return this.age_restrictions.applicable &&
         (this.age_restrictions.min_age || this.age_restrictions.max_age);
});

gymRuleSchema.virtual('priority_score').get(function() {
  const priorityValues = { low: 1, medium: 2, high: 3, critical: 4 };
  return priorityValues[this.priority] * this.importance;
});

gymRuleSchema.methods.isActiveAtTime = function(dateTime = new Date()) {
  if (!this.active) return false;

  if (this.is_time_restricted) {
    const dayOfWeek = dateTime.getDay();
    const currentTime = dateTime.getHours() * 60 + dateTime.getMinutes();

    if (!this.time_restrictions.days_of_week.includes(dayOfWeek)) {
      return false;
    }

    const [startHour, startMin] = this.time_restrictions.start_time.split(':').map(Number);
    const [endHour, endMin] = this.time_restrictions.end_time.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return currentTime >= startTime && currentTime <= endTime;
  }

  return true;
};

gymRuleSchema.methods.appliesToUser = function(user, facilityId = null) {
  if (!this.active) return false;

  if (facilityId && this.facility_id && this.facility_id.toString() !== facilityId.toString()) {
    return false;
  }

  if (this.applies_to === 'all') return true;

  if (!user) return false;

  switch (this.applies_to) {
    case 'members_only':
      return user.subscription_tier !== 'none';
    case 'staff_only':
      return user.role === 'staff' || user.role === 'admin';
    case 'guests':
      return user.subscription_tier === 'none';
    case 'specific_tiers':
      return this.applicable_tiers.includes(user.subscription_tier);
    default:
      return true;
  }
};

gymRuleSchema.methods.isApplicableForAge = function(age) {
  if (!this.is_age_restricted) return true;

  if (this.age_restrictions.min_age && age < this.age_restrictions.min_age) {
    return false;
  }

  if (this.age_restrictions.max_age && age > this.age_restrictions.max_age) {
    return false;
  }

  return true;
};

gymRuleSchema.pre('save', function(next) {
  if (this.age_restrictions.applicable &&
      this.age_restrictions.min_age &&
      this.age_restrictions.max_age &&
      this.age_restrictions.min_age > this.age_restrictions.max_age) {
    return next(new Error('Minimum age cannot be greater than maximum age'));
  }

  if (this.isModified('approval_status') && this.approval_status === 'approved' && !this.approval_date) {
    this.approval_date = new Date();
  }

  if (this.isNew || this.isModified()) {
    this.review_date = new Date();
  }

  next();
});

gymRuleSchema.index({ category: 1, priority: -1, display_order: 1 });
gymRuleSchema.index { active: 1, display_order: 1 };
gymRuleSchema.index({ facility_id: 1, active: 1 });
gymRuleSchema.index({ applies_to: 1 });
gymRuleSchema.index({ approval_status: 1 });
gymRuleSchema.index({ next_review_date: 1 });
gymRuleSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('GymRule', gymRuleSchema);