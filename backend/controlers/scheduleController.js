import { getAlgorithm, listAlgorithms } from '../algorithms/index.js';
import { calculateMetrics, compareAlgorithms, formatMetrics } from '../utils/metrics.js';
import { validateProcesses } from '../utils/parser.js';
import SimulationResult from '../models/SimulationResult.js';

/**
 * Run a single scheduling algorithm
 * POST /api/schedule
 */
export const runSchedule = async (req, res, next) => {
  try {
    const { algorithm, processes, options = {} } = req.body;

    // Validate input
    if (!algorithm) {
      return res.status(400).json({
        success: false,
        error: 'Algorithm name is required'
      });
    }

    if (!processes || !Array.isArray(processes)) {
      return res.status(400).json({
        success: false,
        error: 'Processes array is required'
      });
    }

    // Validate processes
    const validation = validateProcesses(processes);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid processes',
        details: validation.errors
      });
    }

    // Get algorithm function
    let algorithmFn;
    try {
      algorithmFn = getAlgorithm(algorithm);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
        availableAlgorithms: listAlgorithms()
      });
    }

    // Execute algorithm with timing
    const startTime = performance.now();
    const result = algorithmFn(processes, options);
    const executionTime = performance.now() - startTime;

    // Calculate metrics
    const metrics = calculateMetrics(result);
    const formattedMetrics = formatMetrics(metrics);

    // Prepare response
    const response = {
      success: true,
      algorithm: algorithm.toUpperCase(),
      gantt: result.gantt,
      processes: formattedMetrics.perProcess,
      metrics: formattedMetrics.averages,
      configuration: {
        quantum: options.quantum,
        levels: options.levels,
        agingInterval: options.agingInterval
      },
      executionTime: parseFloat(executionTime.toFixed(3))
    };

    // Optionally save to database
    if (req.body.save) {
      const simulationResult = new SimulationResult({
        algorithm: algorithm.toUpperCase(),
        processes: formattedMetrics.perProcess,
        gantt: result.gantt,
        metrics: formattedMetrics,
        configuration: options,
        testCaseId: req.body.testCaseId,
        executionTime
      });
      await simulationResult.save();
      response.resultId = simulationResult._id;
    }

    res.json(response);

  } catch (error) {
    next(error);
  }
};

/**
 * Compare multiple algorithms
 * POST /api/compare
 */
export const compareSchedules = async (req, res, next) => {
  try {
    const { algorithms: algorithmNames, processes, options = {} } = req.body;

    // Validate input
    if (!algorithmNames || !Array.isArray(algorithmNames) || algorithmNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Algorithms array is required',
        availableAlgorithms: listAlgorithms()
      });
    }

    if (!processes || !Array.isArray(processes)) {
      return res.status(400).json({
        success: false,
        error: 'Processes array is required'
      });
    }

    // Validate processes
    const validation = validateProcesses(processes);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid processes',
        details: validation.errors
      });
    }

    const results = {};
    const errors = [];

    // Run each algorithm
    for (const algName of algorithmNames) {
      try {
        const algorithmFn = getAlgorithm(algName);
        const algOptions = options[algName] || options.default || {};
        
        const startTime = performance.now();
        const result = algorithmFn(processes, algOptions);
        const executionTime = performance.now() - startTime;

        const metrics = calculateMetrics(result);
        const formattedMetrics = formatMetrics(metrics);

        results[algName.toUpperCase()] = {
          gantt: result.gantt,
          processes: formattedMetrics.perProcess,
          metrics: formattedMetrics,
          executionTime: parseFloat(executionTime.toFixed(3))
        };
      } catch (err) {
        errors.push({ algorithm: algName, error: err.message });
      }
    }

    // Generate comparison
    const comparison = compareAlgorithms(results);

    res.json({
      success: true,
      results,
      comparison,
      errors: errors.length > 0 ? errors : undefined,
      input: {
        processCount: processes.length,
        algorithmsCompared: Object.keys(results).length
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * List available algorithms
 * GET /api/algorithms
 */
export const getAlgorithms = (req, res) => {
  const algorithms = listAlgorithms();
  
  const descriptions = {
    FCFS: 'First Come First Serve - Non-preemptive, executes in arrival order',
    SJF: 'Shortest Job First - Non-preemptive, selects shortest burst time',
    SRT: 'Shortest Remaining Time - Preemptive SJF',
    RR: 'Round Robin - Preemptive with time quantum',
    HRRN: 'Highest Response Ratio Next - Non-preemptive, considers waiting time',
    FEEDBACK: 'Multilevel Feedback Queue - Multiple priority queues',
    AGING: 'Priority with Aging - Prevents starvation',
    PRIORITY_PREEMPTIVE: 'Priority Scheduling - Preemptive by priority',
    PRIORITY_NON_PREEMPTIVE: 'Priority Scheduling - Non-preemptive by priority'
  };

  res.json({
    success: true,
    algorithms: algorithms.map(name => ({
      name,
      description: descriptions[name] || 'CPU Scheduling Algorithm'
    }))
  });
};

/**
 * Get simulation history
 * GET /api/schedule/history
 */
export const getHistory = async (req, res, next) => {
  try {
    const { limit = 20, algorithm, testCaseId } = req.query;
    
    const query = {};
    if (algorithm) query.algorithm = algorithm.toUpperCase();
    if (testCaseId) query.testCaseId = testCaseId;

    const results = await SimulationResult.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('testCaseId', 'name');

    res.json({
      success: true,
      count: results.length,
      results
    });

  } catch (error) {
    next(error);
  }
};

export default {
  runSchedule,
  compareSchedules,
  getAlgorithms,
  getHistory
};