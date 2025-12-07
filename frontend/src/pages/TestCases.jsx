// src/pages/TestCases.jsx
import { useEffect, useState } from 'react';
import {
  uploadTestCase,
  getTestCases,
  runTestCase,
} from '../services/api';

function TestCases() {
  const [file, setFile] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [runningId, setRunningId] = useState(null);
  const [error, setError] = useState('');
  const [runResult, setRunResult] = useState(null);

  const loadTestCases = async () => {
    setLoadingList(true);
    setError('');
    try {
      const data = await getTestCases();
      // Adjust if backend wraps response (e.g. { testCases: [...] })
      setTestCases(Array.isArray(data) ? data : data.testCases ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to load test cases.'
      );
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadTestCases();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a test case file to upload.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file); // adjust key name to what backend expects

      await uploadTestCase(formData);
      setFile(null);
      await loadTestCases();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to upload test case.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRun = async (id) => {
    setError('');
    setRunResult(null);
    setRunningId(id);
    try {
      const data = await runTestCase(id);
      setRunResult({ id, data });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to run test case.'
      );
    } finally {
      setRunningId(null);
    }
  };

return (
  <div className="page test-cases max-w-4xl mx-auto p-6 space-y-8">
    <h1 className="text-3xl font-bold text-center mb-4">Test Cases</h1>

    {/* Upload Test Case */}
    <section className="section bg-white dark:bg-gray-900 p-5 rounded-lg shadow space-y-3">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Upload Test Case</h2>

      <form onSubmit={handleUpload} className="flex items-center gap-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block text-sm text-gray-700 dark:text-gray-200"
        />

        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </section>

    {/* List Test Cases */}
    <section className="section bg-white dark:bg-gray-900 p-5 rounded-lg shadow space-y-3">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Available Test Cases</h2>

      {loadingList ? (
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      ) : testCases.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No test cases found.</p>
      ) : (
        <ul className="space-y-2">
          {testCases.map((tc) => (
            <li
              key={tc.id ?? tc._id}
              className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2"
            >
              <span className="text-gray-800 dark:text-gray-100">
                <strong>{tc.name ?? tc.filename ?? tc.id}</strong>
                {tc.description ? ` – ${tc.description}` : ''}
              </span>

              <button
                onClick={() => handleRun(tc.id ?? tc._id)}
                disabled={runningId === (tc.id ?? tc._id)}
                className="ml-4 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {runningId === (tc.id ?? tc._id) ? 'Running...' : 'Run'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>

    {/* Error Message */}
    {error && (
      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
    )}

    {/* Run Test Case (Result) */}
    {runResult && (
      <section className="section bg-white dark:bg-gray-900 p-5 rounded-lg shadow space-y-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Run Result</h2>

        <p className="text-gray-700 dark:text-gray-300">
          Test case ID: <strong>{runResult.id}</strong>
        </p>

        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto text-gray-800 dark:text-gray-100">
          {JSON.stringify(runResult.data, null, 2)}
        </pre>
      </section>
    )}
  </div>
);
}

export default TestCases;