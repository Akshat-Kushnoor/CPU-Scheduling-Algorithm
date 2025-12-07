import { Router } from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import {
  uploadTestCase,
  listTestCases,
  getTestCase,
  runTestCase,
  deleteTestCase,
  updateTestCase
} from '../controllers/testCaseController.js';
import { validateRequest } from '../middleware/errorHandler.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'application/json', 'text/csv'];
    const allowedExtensions = ['.txt', '.json', '.csv'];
    
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: .txt, .json, .csv'));
    }
  }
});

/**
 * @route   POST /api/testcases/upload
 * @desc    Upload and parse a test case file
 * @access  Public
 */
router.post(
  '/upload',
  upload.single('file'),
  [
    body('name')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Name must be at most 100 characters'),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Description must be at most 500 characters'),
    body('quantum')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantum must be a positive integer'),
    validateRequest
  ],
  uploadTestCase
);

/**
 * @route   GET /api/testcases
 * @desc    List all test cases
 * @access  Public
 */
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .isString(),
    validateRequest
  ],
  listTestCases
);

/**
 * @route   GET /api/testcases/:id
 * @desc    Get a single test case
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid test case ID'),
    validateRequest
  ],
  getTestCase
);

/**
 * @route   POST /api/testcases/run/:id
 * @desc    Run a stored test case with an algorithm
 * @access  Public
 */
router.post(
  '/run/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid test case ID'),
    body('algorithm')
      .notEmpty()
      .withMessage('Algorithm name is required')
      .isString(),
    body('options')
      .optional()
      .isObject(),
    validateRequest
  ],
  runTestCase
);

/**
 * @route   PUT /api/testcases/:id
 * @desc    Update a test case
 * @access  Public
 */
router.put(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid test case ID'),
    body('name')
      .optional()
      .isString()
      .isLength({ max: 100 }),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 500 }),
    body('processes')
      .optional()
      .isArray(),
    validateRequest
  ],
  updateTestCase
);

/**
 * @route   DELETE /api/testcases/:id
 * @desc    Delete a test case
 * @access  Public
 */
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid test case ID'),
    validateRequest
  ],
  deleteTestCase
);

export default router;