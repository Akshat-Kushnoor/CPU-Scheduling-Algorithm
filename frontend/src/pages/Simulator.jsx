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
  <div className="page simulator mx-auto max-w-4xl p-6">
    <h1 className="text-3xl font-bold mb-6 text-center">CPU Scheduler Simulator</h1>

    {/* Process Input */}
    <form onSubmit={handleRunSimulation} className="sim-form space-y-8">
      <section className="section bg-white p-5 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Process Input</h2>
        <p className="text-gray-600 mb-3">
          Enter a JSON array of processes expected by your backend.
        </p>
        <textarea
          rows={10}
          value={processesText}
          onChange={(e) => setProcessesText(e.target.value)}
          className="w-full p-3 border rounded font-mono text-sm focus:ring focus:ring-blue-300"
        />
      </section>

      {/* Algorithm Selector */}
      <section className="section bg-white p-5 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Algorithm Selector</h2>

        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="p-2 border rounded w-full max-w-xs focus:ring focus:ring-blue-300"
        >
          <option value="FCFS">FCFS</option>
          <option value="SJF">SJF (Non-preemptive)</option>
          <option value="SRTF">SRTF (Preemptive SJF)</option>
          <option value="PRIORITY">Priority</option>
          <option value="RR">Round Robin</option>
        </select>

        {algorithm === "RR" && (
          <div className="mt-2">
            <label className="flex items-center gap-2">
              Time Quantum:
              <input
                type="number"
                min={1}
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(e.target.value)}
                className="p-2 border rounded w-24 focus:ring focus:ring-blue-300"
              />
            </label>
          </div>
        )}
      </section>

      {/* Run Simulation Button */}
      <section className="section">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Running..." : "Run Simulation"}
        </button>
      </section>
    </form>

    {error && (
      <p className="text-red-600 mt-4 font-semibold">{error}</p>
    )}

    {/* GanttChart */}
    {result && (
      <section className="section bg-white p-5 rounded-lg shadow mt-8">
        <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>

        <div className="gantt-chart">
          {Array.isArray(result.ganttChart) ? (
            <div className="flex border p-2 overflow-x-auto gap-1">
              {result.ganttChart.map((slot, idx) => (
                <div
                  key={idx}
                  className="min-w-[60px] border-r text-center p-2"
                >
                  <div className="font-medium">
                    {slot.processId ?? slot.pid ?? "P"}
                  </div>
                  <small className="text-gray-600">
                    {slot.start} - {slot.end}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(result.ganttChart ?? result, null, 2)}
            </pre>
          )}
        </div>
      </section>
    )}

    {/* MetricsDisplay */}
    {result && (
      <section className="section bg-white p-5 rounded-lg shadow mt-8">
        <h2 className="text-xl font-semibold mb-3">Metrics</h2>

        {result.metrics && typeof result.metrics === "object" ? (
          <ul className="space-y-1">
            {Object.entries(result.metrics).map(([key, value]) => (
              <li key={key} className="text-gray-800">
                <strong>{key}:</strong> {String(value)}
              </li>
            ))}
          </ul>
        ) : (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(result.metrics ?? result, null, 2)}
          </pre>
        )}
      </section>
    )}
  </div>
);

}

export default Simulator;