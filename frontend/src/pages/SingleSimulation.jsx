import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext.jsx';
import AlgorithmSelect from '../components/AlgorithmSelect.jsx';
import ProcessTable from '../components/ProcessTable.jsx';
import GanttChart from '../components/GanttChart.jsx';
import MetricsPanel from '../components/MetricsPanel.jsx';
import { runSingleSimulation } from '../api/index.js';

const SingleSimulation = () => {
  const {
    state: { processes, selectedAlgorithm, gantt, metrics, loading },
    actions: { setProcesses, setAlgorithm, setResults, setLoading },
  } = useSimulation();

  const [timeQuantum, setTimeQuantum] = useState(4);
  const [error, setError] = useState('');

  const addProcess = () => {
    setProcesses([
      ...processes,
      {
        pid: processes.length + 1,
        arrivalTime: 0,
        burstTime: 1,
        priority: 0,
      },
    ]);
  };

  const removeProcess = (index) => {
    const updated = processes.filter((_, i) => i !== index);
    setProcesses(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlgorithm) {
      setError('Please select a scheduling algorithm.');
      return;
    }
    if (!processes.length) {
      setError('Please add at least one process.');
      return;
    }
    if (selectedAlgorithm === 'RR' && (!timeQuantum || timeQuantum <= 0)) {
      setError('Please provide a valid time quantum for Round Robin.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = {
        algorithm: selectedAlgorithm,
        processes,
      };
      if (selectedAlgorithm === 'RR') {
        payload.quantum = Number(timeQuantum);
      }

      const data = await runSingleSimulation(payload);
      setResults({
        gantt: data.gantt || [],
        metrics: data.metrics || {},
      });
    } catch (err) {
      console.error(err);
      setResults({ gantt: [], metrics: {} });
      setError(err.message || 'Failed to run simulation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Single Algorithm Simulation
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define processes, choose an algorithm, and visualize the resulting
          schedule and metrics.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <AlgorithmSelect
              value={selectedAlgorithm}
              onChange={setAlgorithm}
            />

            {selectedAlgorithm === 'RR' && (
              <div className="flex flex-col gap-1 max-w-xs">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Time Quantum
                </label>
                <input
                  type="number"
                  min="1"
                  value={timeQuantum}
                  onChange={(e) => setTimeQuantum(Number(e.target.value))}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/70"
                />
              </div>
            )}

            <ProcessTable
              processes={processes}
              onChange={setProcesses}
              onAdd={addProcess}
              onRemove={removeProcess}
              showPriority={true}
            />
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                Run Simulation
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                The processes and algorithm configuration will be sent to the
                backend scheduler service at{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">
                  /api/schedule
                </code>
                .
              </p>
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Running simulation…' : 'Run simulation'}
              </button>
            </div>

            <MetricsPanel metrics={metrics} />
          </div>
        </div>
      </form>

      <GanttChart data={gantt} />
    </div>
  );
};

export default SingleSimulation;