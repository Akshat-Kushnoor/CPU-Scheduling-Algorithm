import mongoose from 'mongoose';

const ganttItemSchema = new mongoose.Schema({
  processId: {
    type: String,
    required: true
  },
  start: {
    type: Number,
    required: true
  },
  end: {
    type: Number,
    required: true
  }
}, { _id: false });

const processMetricSchema = new mongoose.Schema({
  id: String,
  arrivalTime: Number,
  burstTime: Number,
  priority: Number,
  completionTime: Number,
  waitingTime: Number,
  turnaroundTime: Number,
  responseTime: Number
}, { _id: false });

const averageMetricsSchema = new mongoose.Schema({
  avgWaitingTime: Number,
  avgTurnaroundTime: Number,
  avgResponseTime: Number,
  cpuUtilization: Number,
  throughput: Number
}, { _id: false });

const simulationResultSchema = new mongoose.Schema({
  algorithm: {
    type: String,
    required: true,
    enum: ['FCFS', 'SJF', 'SRT', 'RR', 'HRRN', 'FEEDBACK', 'AGING', 'PRIORITY_PREEMPTIVE', 'PRIORITY_NON_PREEMPTIVE']
  },
  processes: [processMetricSchema],
  gantt: [ganttItemSchema],
  metrics: {
    perProcess: [processMetricSchema],
    averages: averageMetricsSchema
  },
  configuration: {
    quantum: Number,
    levels: [{
      quantum: Number,
      priority: Number
    }],
    agingInterval: Number
  },
  testCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase'
  },
  executionTime: {
    type: Number // in milliseconds
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
simulationResultSchema.index({ algorithm: 1 });
simulationResultSchema.index({ testCaseId: 1 });
simulationResultSchema.index({ createdAt: -1 });

const SimulationResult = mongoose.model('SimulationResult', simulationResultSchema);

export default SimulationResult;