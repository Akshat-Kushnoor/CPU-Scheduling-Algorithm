import TestCase from '../models/TestCase.js';
import SimulationResult from '../models/SimulationResult.js';
import { parseTestCase, validateProcesses } from '../utils/parser.js';
import { getAlgorithm } from '../algorithms/index.js';
import { calculateMetrics, formatMetrics } from '../utils/metrics.js';

/**
 * Upload and parse a test case
 * POST /api/testcases/upload
 */
export const uploadTestCase = async (req, res, next) => {
  try {
    let rawInput, name, description;

    // Handle file upload
    if (req.file) {
      rawInput = req.file.buffer.toString('utf-8');
      name = req.body.name || req.file.originalname.replace(/\.[^/.]+$/, '');
      description = req.body.description;
    } 
    // Handle raw text input
    else if (req.body.rawInput) {
      rawInput = req.body.rawInput;
      name = req.body.name || `TestCase_${Date.now()}`;
      description = req.body.description;
    }
    // Handle JSON processes directly
    else if (req.body.processes) {
      rawInput = JSON.stringify(req.body.processes);
      name = req.body.name || `TestCase_${Date.now()}`;
      description = req.body.description;
    }
    else {
      return res.status(400).json({
        success: false,
        error: 'No test case data provided. Send file, rawInput, or processes.'
      });
    }

    // Parse the test case
    const processes = parseTestCase(rawInput, req.file?.originalname || '');

    // Validate
    const validation = validateProcesses(processes);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid test case',
        details: validation.errors
      });
    }

    // Create and save test case
    const testCase = new TestCase({
      name,
      description,
      rawInput,
      processes,
      defaultQuantum: req.body.quantum || 2,
      defaultLevels: req.body.levels
    });

    await testCase.save();

    res.status(201).json({
      success: true,
      message: 'Test case uploaded successfully',
      testCase: {
        id: testCase._id,
        name: testCase.name,
        processCount: processes.length,
        processes: testCase.processes,
        createdAt: testCase.createdAt
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A test case with this name already exists'
      });
    }
    next(error);
  }
};

/**
 * List all test cases
 * GET /api/testcases
 */
export const listTestCases = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [testCases, total] = await Promise.all([
      TestCase.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .select('-rawInput'),
      TestCase.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: testCases.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      testCases: testCases.map(tc => ({
        id: tc._id,
        name: tc.name,
        description: tc.description,
        processCount: tc.processes.length,
        processes: tc.processes,
        defaultQuantum: tc.defaultQuantum,
        createdAt: tc.createdAt
      }))
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get a single test case
 * GET /api/testcases/:id
 */
export const getTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findById(req.params.id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: 'Test case not found'
      });
    }

    res.json({
      success: true,
      testCase: {
        id: testCase._id,
        name: testCase.name,
        description: testCase.description,
        rawInput: testCase.rawInput,
        processes: testCase.processes,
        defaultQuantum: testCase.defaultQuantum,
        defaultLevels: testCase.defaultLevels,
        createdAt: testCase.createdAt,
        updatedAt: testCase.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Run a test case with specified algorithm
 * POST /api/testcases/run/:id
 */
export const runTestCase = async (req, res, next) => {
  try {
    const { algorithm, options = {} } = req.body;

    if (!algorithm) {
      return res.status(400).json({
        success: false,
        error: 'Algorithm name is required'
      });
    }

    // Find test case
    const testCase = await TestCase.findById(req.params.id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: 'Test case not found'
      });
    }

    // Get algorithm
    let algorithmFn;
    try {
      algorithmFn = getAlgorithm(algorithm);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    // Merge options with test case defaults
    const mergedOptions = {
      quantum: options.quantum || testCase.defaultQuantum,
      levels: options.levels || testCase.defaultLevels,
      ...options
    };

    // Execute algorithm
    const startTime = performance.now();
    const result = algorithmFn(testCase.processes, mergedOptions);
    const executionTime = performance.now() - startTime;

    // Calculate metrics
    const metrics = calculateMetrics(result);
    const formattedMetrics = formatMetrics(metrics);

    // Save result
    const simulationResult = new SimulationResult({
      algorithm: algorithm.toUpperCase(),
      processes: formattedMetrics.perProcess,
      gantt: result.gantt,
      metrics: formattedMetrics,
      configuration: mergedOptions,
      testCaseId: testCase._id,
      executionTime
    });

    await simulationResult.save();

    res.json({
      success: true,
      testCase: {
        id: testCase._id,
        name: testCase.name
      },
      algorithm: algorithm.toUpperCase(),
      gantt: result.gantt,
      processes: formattedMetrics.perProcess,
      metrics: formattedMetrics.averages,
      configuration: mergedOptions,
      executionTime: parseFloat(executionTime.toFixed(3)),
      resultId: simulationResult._id
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete a test case
 * DELETE /api/testcases/:id
 */
export const deleteTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findByIdAndDelete(req.params.id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: 'Test case not found'
      });
    }

    // Also delete associated simulation results
    await SimulationResult.deleteMany({ testCaseId: req.params.id });

    res.json({
      success: true,
      message: 'Test case deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update a test case
 * PUT /api/testcases/:id
 */
export const updateTestCase = async (req, res, next) => {
  try {
    const { name, description, processes, defaultQuantum, defaultLevels } = req.body;

    const testCase = await TestCase.findById(req.params.id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: 'Test case not found'
      });
    }

    // Update fields
    if (name) testCase.name = name;
    if (description !== undefined) testCase.description = description;
    if (defaultQuantum) testCase.defaultQuantum = defaultQuantum;
    if (defaultLevels) testCase.defaultLevels = defaultLevels;

    // If processes are updated, validate them
    if (processes) {
      const validation = validateProcesses(processes);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid processes',
          details: validation.errors
        });
      }
      testCase.processes = processes;
      testCase.rawInput = JSON.stringify(processes);
    }

    await testCase.save();

    res.json({
      success: true,
      message: 'Test case updated successfully',
      testCase: {
        id: testCase._id,
        name: testCase.name,
        description: testCase.description,
        processCount: testCase.processes.length,
        processes: testCase.processes,
        defaultQuantum: testCase.defaultQuantum,
        updatedAt: testCase.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
};

export default {
  uploadTestCase,
  listTestCases,
  getTestCase,
  runTestCase,
  deleteTestCase,
  updateTestCase
};