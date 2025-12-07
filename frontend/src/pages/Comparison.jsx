// src/pages/Comparison.jsx
import { useState } from 'react';
import { compareAlgorithms } from '../services/api';

const EXAMPLE_PROCESSES = `[
  { "id": "P1", "arrivalTime": 0, "burstTime": 5, "priority": 2 },
  { "id": "P2", "arrivalTime": 1, "burstTime": 3, "priority": 1 },
  { "id": "P3", "arrivalTime": 2, "burstTime": 8, "priority": 3 }
]`;

const AVAILABLE_ALGOS = ['FCFS', 'SJF', 'SRTF', 'PRIORITY', 'RR'];

function Comparison() {
  const [processesText, setProcessesText] = useState(EXAMPLE_PROCESSES);
  const [selectedAlgos, setSelectedAlgos] = useState(['FCFS', 'SJF']);
  const [timeQuantum, setTimeQuantum] = useState(4); // if your backend uses it for RR
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAlgorithmsChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    setSelectedAlgos(options.map((o) => o.value));
  };

  const handleRunComparison = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (selectedAlgos.length === 0) {
      setError('Select at least one algorithm.');
      return;
    }

    let processes;
    try {
      processes = JSON.parse(processesText);
      if (!Array.isArray(processes)) {
        throw new Error('Process input must be a JSON array.');
      }
    } catch (err) {
      setError(err.message || 'Process input must be valid JSON.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        processes,
        algorithms: selectedAlgos,
        timeQuantum: Number(timeQuantum),
      };

      const data = await compareAlgorithms(payload);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to compare algorithms.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page comparison">
      <h1>Algorithm Comparison</h1>

      <form onSubmit={handleRunComparison} className="comparison-form">
        {/* Process Input */}
        <section className="section">
          <h2>Process Input</h2>
          <textarea
            rows={10}
            value={processesText}
            onChange={(e) => setProcessesText(e.target.value)}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
        </section>

        {/* Multiple Algorithm Selector */}
        <section className="section">
          <h2>Algorithms</h2>
          <p>Hold Ctrl / Cmd to select multiple algorithms.</p>
          <select
            multiple
            size={AVAILABLE_ALGOS.length}
            value={selectedAlgos}
            onChange={handleAlgorithmsChange}
          >
            {AVAILABLE_ALGOS.map((algo) => (
              <option key={algo} value={algo}>
                {algo}
              </option>
            ))}
          </select>

          {selectedAlgos.includes('RR') && (
            <div style={{ marginTop: '0.5rem' }}>
              <label>
                Time Quantum (used for RR):&nbsp;
                <input
                  type="number"
                  min={1}
                  value={timeQuantum}
                  onChange={(e) => setTimeQuantum(e.target.value)}
                />
              </label>
            </div>
          )}
        </section>

        <section className="section">
          <button type="submit" disabled={loading}>
            {loading ? 'Comparing...' : 'Compare Algorithms'}
          </button>
        </section>
      </form>

      {error && (
        <p className="error" style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      {/* ComparisonChart */}
      {result && (
        <section className="section">
          <h2>Comparison Results</h2>

          {/* If your backend returns a structured comparison object,
              you can render a table; here we fall back to JSON. */}
          {Array.isArray(result.comparisons) ? (
            <table border="1" cellPadding="4">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Avg Waiting Time</th>
                  <th>Avg Turnaround Time</th>
                  <th>Throughput</th>
                  <th>CPU Utilization</th>
                </tr>
              </thead>
              <tbody>
                {result.comparisons.map((c) => (
                  <tr key={c.algorithm}>
                    <td>{c.algorithm}</td>
                    <td>{c.metrics?.avgWaitingTime ?? '-'}</td>
                    <td>{c.metrics?.avgTurnaroundTime ?? '-'}</td>
                    <td>{c.metrics?.throughput ?? '-'}</td>
                    <td>{c.metrics?.cpuUtilization ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </section>
      )}
    </div>
  );
}

export default Comparison;