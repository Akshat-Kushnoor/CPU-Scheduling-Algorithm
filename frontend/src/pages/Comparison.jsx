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
  <div className="page comparison max-w-5xl mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6 text-center">Algorithm Comparison</h1>

    <form onSubmit={handleRunComparison} className="comparison-form space-y-8">
      
      {/* Process Input */}
      <section className="section bg-white p-5 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Process Input</h2>
        <textarea
          rows={10}
          value={processesText}
          onChange={(e) => setProcessesText(e.target.value)}
          className="w-full border rounded p-3 font-mono text-sm focus:ring focus:ring-blue-300"
        />
      </section>

      {/* Multiple Algorithm Selector */}
      <section className="section bg-white p-5 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Algorithms</h2>

        <p className="text-gray-600 mb-2">
          Hold Ctrl / Cmd to select multiple algorithms.
        </p>

        <select
          multiple
          size={AVAILABLE_ALGOS.length}
          value={selectedAlgos}
          onChange={handleAlgorithmsChange}
          className="border rounded p-2 w-full max-w-xs focus:ring focus:ring-blue-300"
        >
          {AVAILABLE_ALGOS.map((algo) => (
            <option key={algo} value={algo}>
              {algo}
            </option>
          ))}
        </select>

        {selectedAlgos.includes("RR") && (
          <div className="mt-2">
            <label className="flex items-center gap-2">
              Time Quantum (used for RR):
              <input
                type="number"
                min={1}
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(e.target.value)}
                className="border rounded p-2 w-24 focus:ring focus:ring-blue-300"
              />
            </label>
          </div>
        )}
      </section>

      <section className="section">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Comparing..." : "Compare Algorithms"}
        </button>
      </section>
    </form>

    {error && (
      <p className="text-red-600 mt-4 font-semibold">{error}</p>
    )}

    {/* ComparisonChart */}
    {result && (
      <section className="section bg-white p-5 rounded-lg shadow mt-8">
        <h2 className="text-xl font-semibold mb-4">Comparison Results</h2>

        {Array.isArray(result.comparisons) ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Algorithm</th>
                  <th className="border px-3 py-2">Avg Waiting Time</th>
                  <th className="border px-3 py-2">Avg Turnaround Time</th>
                  <th className="border px-3 py-2">Throughput</th>
                  <th className="border px-3 py-2">CPU Utilization</th>
                </tr>
              </thead>

              <tbody>
                {result.comparisons.map((c) => (
                  <tr key={c.algorithm} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-3 py-2 font-medium">{c.algorithm}</td>
                    <td className="border px-3 py-2">{c.metrics?.avgWaitingTime ?? "-"}</td>
                    <td className="border px-3 py-2">{c.metrics?.avgTurnaroundTime ?? "-"}</td>
                    <td className="border px-3 py-2">{c.metrics?.throughput ?? "-"}</td>
                    <td className="border px-3 py-2">{c.metrics?.cpuUtilization ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    )}
  </div>
);

}

export default Comparison;