const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount cannot be negative']
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'pending', 'refunded'],
    default: 'success'
  },
  paypal_payment_id: {
    type: String,
    trim: true
  },
  payment_method: {
    type: String,
    enum: ['paypal', 'credit_card', 'bank_transfer'],
    default: 'paypal'
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
});

const subscriptionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  tier: {
    type: String,
    required: [true, 'Subscription tier is required'],
    enum: ['basic', 'premium', 'elite'],
    index: true
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(endDate) {
        return endDate > this.start_date;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    required: [true, 'Subscription status is required'],
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'active',
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Subscription amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  billing_cycle: {
    type: String,
    required: [true, 'Billing cycle is required'],
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  paypal_subscription_id: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  paypal_plan_id: {
    type: String,
    trim: true
  },
  auto_renew: {
    type: Boolean,
    default: true
  },
  payment_history: [paymentHistorySchema],
  cancellation_reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelled_at: {
    type: Date
  },
  trial_end_date: {
    type: Date
  },
  discount_code: {
    type: String,
    trim: true
  },
  discount_amount: {
    type: Number,
    min: [0, 'Discount amount cannot be negative']
  },
  renewal_count: {
    type: Number,
    default: 0,
    min: [0, 'Renewal count cannot be negative']
  },
  last_payment_date: {
    type: Date
  },
  next_billing_date: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: { createdAt: 'created_at', updated_at: 'updated_at' }
});

subscriptionSchema.virtual('is_active').get(function() {
  return this.status === 'active' && this.end_date > new Date();
});

subscriptionSchema.virtual('is_trial').get(function() {
  return this.trial_end_date && this.trial_end_date > new Date();
});

subscriptionSchema.virtual('days_remaining').get(function() {
  if (!this.end_date) return 0;
  const now = new Date();
  const diffTime = this.end_date - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

subscriptionSchema.virtual('monthly_equivalent').get(function() {
  if (this.billing_cycle === 'monthly') return this.amount;
  return Math.round(this.amount / 12 * 100) / 100;
});

subscriptionSchema.methods.calculateNextBillingDate = function() {
  const nextDate = new Date(this.end_date);
  if (this.billing_cycle === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (this.billing_cycle === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }
  return nextDate;
};

subscriptionSchema.methods.addPayment = function(paymentData) {
  this.payment_history.push(paymentData);
  this.last_payment_date = paymentData.date;
  if (paymentData.status === 'success') {
    this.next_billing_date = this.calculateNextBillingDate();
    this.renewal_count += 1;
  }
  return this.save();
};

subscriptionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelled_at) {
    this.cancelled_at = new Date();
  }

  if (this.isNew) {
    this.next_billing_date = this.calculateNextBillingDate();
  }

  next();
});

subscriptionSchema.index({ user_id: 1, status: 1 });
subscriptionSchema.index({ status: 1, end_date: -1 });
subscriptionSchema.index({ tier: 1, status: 1 });
subscriptionSchema.index({ paypal_subscription_id: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);