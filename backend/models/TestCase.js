import mongoose from 'mongoose';

const processSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: Number,
    required: true,
    min: 0
  },
  burstTime: {
    type: Number,
    required: true,
    min: 1
  },
  priority: {
    type: Number,
    default: 0
  }
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test case name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  rawInput: {
    type: String,
    required: true
  },
  processes: {
    type: [processSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one process is required'
    }
  },
  defaultQuantum: {
    type: Number,
    default: 2,
    min: 1
  },
  defaultLevels: {
    type: [{
      quantum: Number,
      priority: Number
    }],
    default: [
      { quantum: 1, priority: 0 },
      { quantum: 2, priority: 1 },
      { quantum: 4, priority: 2 }
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
testCaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
testCaseSchema.index({ name: 1 });
testCaseSchema.index({ createdAt: -1 });

const TestCase = mongoose.model('TestCase', testCaseSchema);

export default TestCase;