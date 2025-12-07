// src/pages/Simulator.jsx
import { useState } from 'react';
import { runSimulation } from '../services/api';

const EXAMPLE_PROCESSES = `[
  { "id": "P1", "arrivalTime": 0, "burstTime": 5, "priority": 2 },
  { "id": "P2", "arrivalTime": 1, "burstTime": 3, "priority": 1 },
  { "id": "P3", "arrivalTime": 2, "burstTime": 8, "priority": 3 }
]`;

function Simulator() {
  const [processesText, setProcessesText] = useState(EXAMPLE_PROCESSES);
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

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
        algorithm,
        // send timeQuantum only if relevant
        ...(algorithm === 'RR' ? { timeQuantum: Number(timeQuantum) } : {}),
      };

      const data = await runSimulation(payload);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to run simulation.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page simulator">
      <h1>CPU Scheduler Simulator</h1>

      {/* Process Input */}
      <form onSubmit={handleRunSimulation} className="sim-form">
        <section className="section">
          <h2>Process Input</h2>
          <p>Enter a JSON array of processes expected by your backend.</p>
          <textarea
            rows={10}
            value={processesText}
            onChange={(e) => setProcessesText(e.target.value)}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
        </section>

        {/* Algorithm Selector */}
        <section className="section">
          <h2>Algorithm Selector</h2>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option value="FCFS">FCFS</option>
            <option value="SJF">SJF (Non-preemptive)</option>
            <option value="SRTF">SRTF (Preemptive SJF)</option>
            <option value="PRIORITY">Priority</option>
            <option value="RR">Round Robin</option>
          </select>

          {algorithm === 'RR' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label>
                Time Quantum:&nbsp;
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

        {/* Run Simulation Button */}
        <section className="section">
          <button type="submit" disabled={loading}>
            {loading ? 'Running...' : 'Run Simulation'}
          </button>
        </section>
      </form>

      {error && (
        <p className="error" style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      {/* GanttChart */}
      {result && (
        <section className="section">
          <h2>Gantt Chart</h2>
          <div className="gantt-chart">
            {Array.isArray(result.ganttChart) ? (
              <div
                style={{
                  display: 'flex',
                  border: '1px solid #ccc',
                  padding: '4px',
                  overflowX: 'auto',
                }}
              >
                {result.ganttChart.map((slot, idx) => (
                  <div
                    key={idx}
                    style={{
                      minWidth: '60px',
                      borderRight: '1px solid #eee',
                      textAlign: 'center',
                      padding: '4px',
                    }}
                  >
                    <div>{slot.processId ?? slot.pid ?? 'P'}</div>
                    <small>
                      {slot.start} - {slot.end}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <pre>{JSON.stringify(result.ganttChart ?? result, null, 2)}</pre>
            )}
          </div>
        </section>
      )}

      {/* MetricsDisplay */}
      {result && (
        <section className="section">
          <h2>Metrics</h2>
          {result.metrics && typeof result.metrics === 'object' ? (
            <ul>
              {Object.entries(result.metrics).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {String(value)}
                </li>
              ))}
            </ul>
          ) : (
            <pre>{JSON.stringify(result.metrics ?? result, null, 2)}</pre>
          )}
        </section>
      )}
    </div>
  );
}

export default Simulator;