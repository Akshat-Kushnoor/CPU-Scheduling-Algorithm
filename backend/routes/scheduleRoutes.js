import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  runSchedule,
  compareSchedules,
  getAlgorithms,
  getHistory
} from '../controllers/scheduleController.js';
import { validateRequest } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @route   GET /api/algorithms
 * @desc    List available scheduling algorithms
 * @access  Public
 */
router.get('/algorithms', getAlgorithms);

/**
 * @route   POST /api/schedule
 * @desc    Run a single scheduling algorithm
 * @access  Public
 */
router.post(
  '/',
  [
    body('algorithm')
      .notEmpty()
      .withMessage('Algorithm name is required')
      .isString(),
    body('processes')
      .isArray({ min: 1 })
      .withMessage('Processes must be a non-empty array'),
    body('processes.*.id')
      .notEmpty()
      .withMessage('Process id is required'),
    body('processes.*.arrivalTime')
      .isInt({ min: 0 })
      .withMessage('Arrival time must be a non-negative integer'),
    body('processes.*.burstTime')
      .isInt({ min: 1 })
      .withMessage('Burst time must be a positive integer'),
    body('options.quantum')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantum must be a positive integer'),
    validateRequest
  ],
  runSchedule
);

/**
 * @route   POST /api/compare
 * @desc    Compare multiple scheduling algorithms
 * @access  Public
 */
router.post(
  '/compare',
  [
    body('algorithms')
      .isArray({ min: 1 })
      .withMessage('Algorithms must be a non-empty array'),
    body('processes')
      .isArray({ min: 1 })
      .withMessage('Processes must be a non-empty array'),
    validateRequest
  ],
  compareSchedules
);

/**
 * @route   GET /api/schedule/history
 * @desc    Get simulation history
 * @access  Public
 */
router.get(
  '/history',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('algorithm')
      .optional()
      .isString(),
    validateRequest
  ],
  getHistory
);

export default router;