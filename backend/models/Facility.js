const mongoose = require('mongoose');

const operatingHoursSchema = new mongoose.Schema({
  monday: {
    open: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    close: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
  },
  tuesday: {
    open: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    close: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
  },
  wednesday: {
    open: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    close: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
  },
  thursday: {
    open: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    close: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
  },
  friday: {
    open: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    close: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
  },
  saturday: {
    open: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    close: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
  },
  sunday: {
    open: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    close: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
  }
});

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [100, 'Equipment name cannot exceed 100 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Equipment quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  available: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Available quantity cannot be negative'],
    validate: {
      validator: function(available) {
        return available <= this.quantity;
      },
      message: 'Available quantity cannot exceed total quantity'
    }
  },
  maintenance_status: {
    type: String,
    enum: ['operational', 'maintenance', 'out_of_order'],
    default: 'operational'
  },
  last_maintenance: {
    type: Date
  },
  next_maintenance: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [300, 'Equipment notes cannot exceed 300 characters']
  }
});

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Facility name is required'],
    trim: true,
    maxlength: [200, 'Facility name cannot exceed 200 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State name cannot exceed 100 characters']
    },
    zip_code: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
    },
    country: {
      type: String,
      default: 'USA',
      trim: true,
      maxlength: [100, 'Country name cannot exceed 100 characters']
    }
  },
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  operating_hours: {
    type: operatingHoursSchema,
    required: [true, 'Operating hours are required']
  },
  equipment: [equipmentSchema],
  amenities: [{
    type: String,
    enum: [
      'pool', 'sauna', 'steam_room', 'hot_tub', 'locker_room', 'showers',
      'parking', 'wifi', 'cardio_area', 'weight_area', 'stretching_area',
      'group_fitness_room', 'personal_training', 'nutrition_cafe', 'pro_shop',
      'child_care', 'physical_therapy', 'sports_court', 'climbing_wall',
      'indoor_track', 'outdoor_track', 'basketball_court', 'volleyball_court',
      'racquetball_court', 'tennis_court', 'yoga_studio', 'pilates_studio'
    ]
  }],
  facility_type: {
    type: String,
    enum: ['main_gym', 'branch', 'specialty', 'outdoor', 'temporary'],
    default: 'main_gym'
  },
  size_sqft: {
    type: Number,
    min: [100, 'Facility size must be at least 100 sqft'],
    max: [500000, 'Facility size seems unrealistic']
  },
  max_capacity: {
    type: Number,
    min: [1, 'Max capacity must be at least 1']
  },
  current_occupancy: {
    type: Number,
    min: [0, 'Current occupancy cannot be negative'],
    validate: {
      validator: function(occupancy) {
        return !this.max_capacity || occupancy <= this.max_capacity;
      },
      message: 'Current occupancy cannot exceed maximum capacity'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [100, 'Feature name cannot exceed 100 characters']
  }],
  rules: [{
    type: String,
    trim: true,
    maxlength: [300, 'Rule cannot exceed 300 characters']
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
  virtual_tour_url: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        return !url || /^https?:\/\/.+/i.test(url);
      },
      message: 'Please provide a valid URL'
    }
  },
  manager_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Manager name cannot exceed 100 characters']
  },
  manager_email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  established_date: {
    type: Date,
    max: [new Date(), 'Established date cannot be in the future']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review_count: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  covid_protocols: {
    mask_required: { type: Boolean, default: false },
    capacity_limit: { type: Boolean, default: false },
    enhanced_cleaning: { type: Boolean, default: true },
    hand_sanitizer: { type: Boolean, default: true }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

facilitySchema.virtual('full_address').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zip_code}`;
});

facilitySchema.virtual('occupancy_percentage').get(function() {
  if (!this.max_capacity || this.max_capacity === 0) return 0;
  return Math.round((this.current_occupancy / this.max_capacity) * 100);
});

facilitySchema.virtual('is_open').get(function() {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const hours = this.operating_hours[currentDay];
  if (!hours) return false;

  const [openHour, openMin] = hours.open.split(':').map(Number);
  const [closeHour, closeMin] = hours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime <= closeTime;
});

facilitySchema.virtual('total_equipment').get(function() {
  return this.equipment.reduce((total, item) => total + item.quantity, 0);
});

facilitySchema.virtual('available_equipment').get(function() {
  return this.equipment.reduce((total, item) => total + item.available, 0);
});

facilitySchema.methods.updateOccupancy = function(change) {
  this.current_occupancy = Math.max(0, Math.min(this.max_capacity, this.current_occupancy + change));
  return this.save();
};

facilitySchema.index({ 'address.city': 1 });
facilitySchema.index({ 'address.state': 1 });
facilitySchema.index({ coordinates: '2dsphere' });
facilitySchema.index({ facility_type: 1 });
facilitySchema.index({ active: 1, rating: -1 });

module.exports = mongoose.model('Facility', facilitySchema);