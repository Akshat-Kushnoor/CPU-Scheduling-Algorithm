// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// POST /api/schedule
export const runSimulation = (payload) =>
  api.post('/api/schedule', payload).then((res) => res.data);

// POST /api/compare
export const compareAlgorithms = (payload) =>
  api.post('/api/compare', payload).then((res) => res.data);

// POST /api/testcases/upload
export const uploadTestCase = (formData) =>
  api
    .post('/api/testcases/upload', formData, {
      // Let the browser set the multipart boundary
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);

// GET /api/testcases
export const getTestCases = () =>
  api.get('/api/testcases').then((res) => res.data);

// POST /api/testcases/run/:id
export const runTestCase = (id) =>
  api.post(`/api/testcases/run/${id}`).then((res) => res.data);

export default {
  runSimulation,
  compareAlgorithms,
  uploadTestCase,
  getTestCases,
  runTestCase,
};