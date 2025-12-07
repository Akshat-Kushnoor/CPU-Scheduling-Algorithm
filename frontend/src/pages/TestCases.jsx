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
    <div className="page test-cases">
      <h1>Test Cases</h1>

      {/* Upload Test Case */}
      <section className="section">
        <h2>Upload Test Case</h2>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </section>

      {/* List Test Cases */}
      <section className="section">
        <h2>Available Test Cases</h2>
        {loadingList ? (
          <p>Loading...</p>
        ) : testCases.length === 0 ? (
          <p>No test cases found.</p>
        ) : (
          <ul>
            {testCases.map((tc) => (
              <li key={tc.id ?? tc._id}>
                <strong>{tc.name ?? tc.filename ?? tc.id}</strong>
                {tc.description ? ` – ${tc.description}` : ''}
                <button
                  style={{ marginLeft: '1rem' }}
                  onClick={() => handleRun(tc.id ?? tc._id)}
                  disabled={runningId === (tc.id ?? tc._id)}
                >
                  {runningId === (tc.id ?? tc._id) ? 'Running...' : 'Run'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p className="error" style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      {/* Run Test Case (Result) */}
      {runResult && (
        <section className="section">
          <h2>Run Result</h2>
          <p>
            Test case ID: <strong>{runResult.id}</strong>
          </p>
          <pre>{JSON.stringify(runResult.data, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}

export default TestCases;