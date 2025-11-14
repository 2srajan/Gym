const mongoose = require('mongoose');

const notificationMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['email', 'push', 'sms'],
    default: 'email'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const reminderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Reminder type is required'],
    enum: ['workout', 'payment', 'general', 'appointment', 'goal', 'nutrition'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true,
    maxlength: [200, 'Reminder title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Reminder message is required'],
    trim: true,
    maxlength: [1000, 'Reminder message cannot exceed 1000 characters']
  },
  scheduled_time: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    index: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'once',
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'cancelled', 'failed', 'paused'],
    default: 'pending',
    index: true
  },
  notification_methods: [notificationMethodSchema],
  last_sent: {
    type: Date
  },
  next_send: {
    type: Date,
    index: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  timezone: {
    type: String,
    default: 'UTC'
  },
  lead_time_minutes: {
    type: Number,
    default: 0,
    min: [0, 'Lead time cannot be negative'],
    max: [10080, 'Lead time cannot exceed 7 days (10080 minutes)']
  },
  snooze_count: {
    type: Number,
    default: 0,
    min: [0, 'Snooze count cannot be negative']
  },
  max_snoozes: {
    type: Number,
    default: 3,
    min: [0, 'Max snoozes cannot be negative'],
    max: [10, 'Max snoozes cannot exceed 10']
  },
  completion_actions: [{
    type: String,
    enum: ['mark_todo_done', 'log_workout', 'send_feedback', 'schedule_next']
  }],
  related_entity: {
    type: {
      type: String,
      enum: ['workout', 'todo', 'subscription', 'goal', 'facility']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  failed_attempts: {
    type: Number,
    default: 0,
    min: [0, 'Failed attempts cannot be negative']
  },
  max_attempts: {
    type: Number,
    default: 3,
    min: [1, 'Max attempts must be at least 1'],
    max: [10, 'Max attempts cannot exceed 10']
  },
  skip_weekends: {
    type: Boolean,
    default: false
  },
  custom_schedule: {
    days_of_week: [{
      type: Number,
      min: [0, 'Day must be between 0 (Sunday) and 6 (Saturday)'],
      max: [6, 'Day must be between 0 (Sunday) and 6 (Saturday)']
    }],
    day_of_month: {
      type: Number,
      min: [1, 'Day of month must be between 1 and 31'],
      max: [31, 'Day of month must be between 1 and 31']
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

reminderSchema.virtual('is_overdue').get(function() {
  return this.status === 'pending' && this.scheduled_time < new Date();
});

reminderSchema.virtual('is_snoozable').get(function() {
  return this.snooze_count < this.max_snoozes;
});

reminderSchema.virtual('can_retry').get(function() {
  return this.status === 'failed' && this.failed_attempts < this.max_attempts;
});

reminderSchema.methods.calculateNextSend = function() {
  if (this.frequency === 'once') {
    this.next_send = null;
    return;
  }

  const lastSent = this.last_sent || this.scheduled_time;
  let nextDate = new Date(lastSent);

  switch (this.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      if (this.custom_schedule && this.custom_schedule.days_of_week.length > 0) {
        const today = nextDate.getDay();
        const targetDays = this.custom_schedule.days_of_week.sort();
        const nextDay = targetDays.find(day => day > today) || targetDays[0];
        const daysToAdd = nextDay > today ? nextDay - today : 7 - today + nextDay;
        nextDate.setDate(nextDate.getDate() + daysToAdd);
      } else {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;
    case 'monthly':
      if (this.custom_schedule && this.custom_schedule.day_of_month) {
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(Math.min(this.custom_schedule.day_of_month, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }

  if (this.skip_weekends && (nextDate.getDay() === 0 || nextDate.getDay() === 6)) {
    do {
      nextDate.setDate(nextDate.getDate() + 1);
    } while (nextDate.getDay() === 0 || nextDate.getDay() === 6);
  }

  this.next_send = nextDate;
};

reminderSchema.methods.snooze = function(minutes = 60) {
  if (!this.is_snoozable) {
    throw new Error('Maximum snoozes reached');
  }

  this.snooze_count += 1;
  this.scheduled_time = new Date(Date.now() + minutes * 60 * 1000);
  this.status = 'pending';

  return this.save();
};

reminderSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.last_sent = new Date();
  this.snooze_count = 0;
  this.failed_attempts = 0;
  this.calculateNextSend();

  return this.save();
};

reminderSchema.methods.markAsFailed = function(error = null) {
  this.status = 'failed';
  this.failed_attempts += 1;

  if (error) {
    this.metadata.last_error = {
      message: error.message,
      timestamp: new Date(),
      type: error.constructor.name
    };
  }

  if (!this.can_retry) {
    this.active = false;
  }

  return this.save();
};

reminderSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('scheduled_time') || this.isModified('frequency')) {
    if (this.frequency !== 'once' && this.active) {
      this.calculateNextSend();
    }
  }

  if (this.isModified('status') && this.status === 'sent') {
    this.last_sent = new Date();
  }

  next();
});

reminderSchema.index({ user_id: 1, active: 1, scheduled_time: 1 });
reminderSchema.index({ next_send: 1, active: 1 });
reminderSchema.index({ type: 1, status: 1 });
reminderSchema.index({ priority: -1, scheduled_time: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);