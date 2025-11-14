const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  task: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [500, 'Task cannot exceed 500 characters']
  },
  due_date: {
    type: Date,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    index: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    index: true
  },
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  completed_at: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
    index: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  estimated_time_minutes: {
    type: Number,
    min: [1, 'Estimated time must be at least 1 minute'],
    max: [480, 'Estimated time cannot exceed 8 hours']
  },
  actual_time_minutes: {
    type: Number,
    min: [0, 'Actual time cannot be negative'],
    max: [480, 'Actual time cannot exceed 8 hours']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'],
    default: 'not_started',
    index: true
  },
  related_type: {
    type: String,
    enum: ['workout', 'goal', 'reminder', 'facility', 'subscription', 'other']
  },
  related_id: {
    type: mongoose.Schema.Types.ObjectId
  },
  parent_todo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo'
  },
  subtasks: [{
    task: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Subtask cannot exceed 200 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    completed_at: {
      type: Date
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    file_type: {
      type: String,
      enum: ['image', 'document', 'video', 'other']
    },
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    reminder_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reminder'
    },
    minutes_before: {
      type: Number,
      default: 0,
      min: [0, 'Reminder time cannot be negative']
    }
  }],
  recurrence: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1,
      min: [1, 'Interval must be at least 1']
    },
    days_of_week: [{
      type: Number,
      min: [0, 'Day must be between 0 (Sunday) and 6 (Saturday)'],
      max: [6, 'Day must be between 0 (Sunday) and 6 (Saturday)']
    }],
    day_of_month: {
      type: Number,
      min: [1, 'Day of month must be between 1 and 31'],
      max: [31, 'Day of month must be between 1 and 31']
    },
    end_date: {
      type: Date
    }
  },
  visibility: {
    type: String,
    enum: ['private', 'shared', 'public'],
    default: 'private'
  },
  collaboration: {
    shared_with: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permission: {
        type: String,
        enum: ['view', 'edit', 'admin'],
        default: 'view'
      },
      shared_at: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
      },
      created_at: {
        type: Date,
        default: Date.now
      }
    }]
  },
  completion_criteria: {
    type: String,
    trim: true,
    maxlength: [300, 'Completion criteria cannot exceed 300 characters']
  },
  energy_required: {
    type: Number,
    min: [1, 'Energy required must be at least 1'],
    max: [10, 'Energy required cannot exceed 10']
  },
  satisfaction_score: {
    type: Number,
    min: [1, 'Satisfaction score must be at least 1'],
    max: [10, 'Satisfaction score cannot exceed 10']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  weather_dependency: {
    type: Boolean,
    default: false
  },
  cost_estimate: {
    amount: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updated_at: 'updated_at' }
});

todoSchema.virtual('is_overdue').get(function() {
  return !this.completed && this.due_date && this.due_date < new Date();
});

todoSchema.virtual('is_due_today').get(function() {
  if (!this.due_date) return false;
  const today = new Date();
  const dueDate = new Date(this.due_date);
  return today.toDateString() === dueDate.toDateString();
});

todoSchema.virtual('is_due_soon').get(function() {
  if (!this.due_date || this.completed) return false;
  const now = new Date();
  const timeDiff = this.due_date.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff <= 3 && daysDiff >= 0;
});

todoSchema.virtual('subtask_completion_percentage').get(function() {
  if (this.subtasks.length === 0) return 0;
  const completed = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

todoSchema.virtual('has_subtasks').get(function() {
  return this.subtasks && this.subtasks.length > 0;
});

todoSchema.methods.markAsCompleted = function() {
  this.completed = true;
  this.completed_at = new Date();
  this.status = 'completed';

  this.subtasks.forEach(subtask => {
    if (!subtask.completed) {
      subtask.completed = true;
      subtask.completed_at = new Date();
    }
  });

  return this.save();
};

todoSchema.methods.addSubtask = function(taskText) {
  this.subtasks.push({
    task: taskText,
    completed: false
  });
  return this.save();
};

todoSchema.methods.toggleSubtask = function(subtaskIndex) {
  if (subtaskIndex >= 0 && subtaskIndex < this.subtasks.length) {
    this.subtasks[subtaskIndex].completed = !this.subtasks[subtaskIndex].completed;
    if (this.subtasks[subtaskIndex].completed) {
      this.subtasks[subtaskIndex].completed_at = new Date();
    } else {
      this.subtasks[subtaskIndex].completed_at = undefined;
    }
  }
  return this.save();
};

todoSchema.methods.createNextInstance = function() {
  if (!this.recurrence.enabled) return null;

  const nextTodo = new this.constructor({
    user_id: this.user_id,
    task: this.task,
    priority: this.priority,
    category: this.category,
    tags: [...this.tags],
    estimated_time_minutes: this.estimated_time_minutes,
    difficulty: this.difficulty,
    related_type: this.related_type,
    related_id: this.related_id,
    completion_criteria: this.completion_criteria,
    energy_required: this.energy_required,
    location: this.location,
    weather_dependency: this.weather_dependency,
    cost_estimate: this.cost_estimate ? { ...this.cost_estimate } : undefined,
    recurrence: { ...this.recurrence },
    parent_todo: this._id
  });

  let nextDueDate = new Date(this.due_date || new Date());

  switch (this.recurrence.pattern) {
    case 'daily':
      nextDueDate.setDate(nextDueDate.getDate() + this.recurrence.interval);
      break;
    case 'weekly':
      if (this.recurrence.days_of_week && this.recurrence.days_of_week.length > 0) {
        const currentDay = nextDueDate.getDay();
        const targetDays = this.recurrence.days_of_week.sort();
        let nextDayIndex = 0;

        for (let i = 0; i < targetDays.length; i++) {
          if (targetDays[i] > currentDay) {
            nextDayIndex = i;
            break;
          }
          if (i === targetDays.length - 1) {
            nextDayIndex = 0;
          }
        }

        const targetDay = targetDays[nextDayIndex];
        const daysToAdd = targetDay > currentDay ?
          targetDay - currentDay :
          7 - currentDay + targetDay;

        nextDueDate.setDate(nextDueDate.getDate() + daysToAdd);
      } else {
        nextDueDate.setDate(nextDueDate.getDate() + (7 * this.recurrence.interval));
      }
      break;
    case 'monthly':
      if (this.recurrence.day_of_month) {
        const targetDay = Math.min(
          this.recurrence.day_of_month,
          new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1 + this.recurrence.interval, 0).getDate()
        );
        nextDueDate.setMonth(nextDueDate.getMonth() + this.recurrence.interval, targetDay);
      } else {
        nextDueDate.setMonth(nextDueDate.getMonth() + this.recurrence.interval);
      }
      break;
    case 'yearly':
      nextDueDate.setFullYear(nextDueDate.getFullYear() + this.recurrence.interval);
      break;
  }

  if (this.recurrence.end_date && nextDueDate > this.recurrence.end_date) {
    return null;
  }

  nextTodo.due_date = nextDueDate;
  return nextTodo.save();
};

todoSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed && !this.completed_at) {
    this.completed_at = new Date();
    this.status = 'completed';
  }

  if (this.isModified('completed') && !this.completed) {
    this.completed_at = undefined;
  }

  next();
});

todoSchema.index({ user_id: 1, completed: 1 });
todoSchema.index({ user_id: 1, due_date: 1 });
todoSchema.index({ user_id: 1, priority: -1 });
todoSchema.index({ category: 1, completed: 1 });
todoSchema.index({ tags: 1 });
todoSchema.index({ status: 1, due_date: 1 });
todoSchema.index({ created_at: -1 });

module.exports = mongoose.model('Todo', todoSchema);