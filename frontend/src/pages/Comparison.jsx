// src/pages/Comparison.jsx
import { useState } from 'react';
import { compareAlgorithms } from '../services/api';

const EXAMPLE_PROCESSES = [
  { "id": "P1", "arrivalTime": 0, "burstTime": 5, "priority": 2 },
  { "id": "P2", "arrivalTime": 1, "burstTime": 3, "priority": 1 },
  { "id": "P3", "arrivalTime": 2, "burstTime": 8, "priority": 3 }
];

const AVAILABLE_ALGOS = [
  { id: 'FCFS', name: 'First Come First Serve', description: 'Non-preemptive, by arrival order' },
  { id: 'SJF', name: 'Shortest Job First', description: 'Non-preemptive, shortest burst first' },
  { id: 'SRT', name: 'Shortest Remaining Time', description: 'Preemptive version of SJF' },
  { id: 'PRIORITY_NON_PREEMPTIVE', name: 'Priority (Non-Preemptive)', description: 'Based on priority value' },
  { id: 'PRIORITY_PREEMPTIVE', name: 'Priority (Preemptive)', description: 'Preemptive priority scheduling' },
  { id: 'RR', name: 'Round Robin', description: 'Time-sliced execution' },
  { id: 'HRRN', name: 'Highest Response Ratio Next', description: 'Dynamic priority based on wait time' },
];

const COLORS = {
  FCFS: '#4f46e5',
  SJF: '#10b981',
  SRT: '#f59e0b',
  PRIORITY_NON_PREEMPTIVE: '#ef4444',
  PRIORITY_PREEMPTIVE: '#dc2626',
  RR: '#8b5cf6',
  HRRN: '#06b6d4',
};

// ============ TRANSFORM API RESPONSE ============
function transformApiResponse(apiData) {
  if (!apiData || !apiData.results) {
    return { comparisons: [], errors: apiData?.errors || [] };
  }

  const comparisons = [];
  
  Object.entries(apiData.results).forEach(([algorithmName, algorithmData]) => {
    if (algorithmData) {
      comparisons.push({
        algorithm: algorithmName,
        metrics: {
          avgWaitingTime: algorithmData.metrics?.averages?.avgWaitingTime,
          avgTurnaroundTime: algorithmData.metrics?.averages?.avgTurnaroundTime,
          avgResponseTime: algorithmData.metrics?.averages?.avgResponseTime,
          cpuUtilization: algorithmData.metrics?.averages?.cpuUtilization,
          throughput: algorithmData.metrics?.averages?.throughput,
          totalTime: algorithmData.metrics?.averages?.totalTime || 
                     algorithmData.metrics?.averages?.lastCompletion,
          contextSwitches: algorithmData.metrics?.averages?.contextSwitches,
        },
        gantt: algorithmData.gantt || [],
        processes: algorithmData.processes || [],
        executionTime: algorithmData.executionTime,
      });
    }
  });

  return {
    comparisons,
    comparison: apiData.comparison,
    errors: apiData.errors || [],
    input: apiData.input,
  };
}

// ============ COMPARISON BAR CHART ============
function ComparisonBarChart({ data, metric, label, lowerIsBetter = true }) {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d.metrics?.[metric]).filter(v => v !== undefined && v !== null);
  if (values.length === 0) return null;

  const maxValue = Math.max(...values, 0.1);
  const minValue = Math.min(...values);
  const bestValue = lowerIsBetter ? minValue : Math.max(...values);

  const chartWidth = 500;
  const barHeight = 35;
  const chartHeight = data.length * (barHeight + 10) + 40;
  const leftMargin = 100;
  const rightMargin = 70;
  const barWidth = chartWidth - leftMargin - rightMargin;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{label}</h3>
      <svg width={chartWidth} height={chartHeight} className="font-sans">
        {data.map((item, index) => {
          const value = item.metrics?.[metric];
          if (value === undefined || value === null) return null;
          
          const width = (value / maxValue) * barWidth;
          const y = index * (barHeight + 10) + 10;
          const isBest = value === bestValue;

          return (
            <g key={item.algorithm}>
              {/* Algorithm label */}
              <text
                x={leftMargin - 10}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fontSize={11}
                fontWeight={isBest ? '700' : '500'}
                fill={isBest ? COLORS[item.algorithm] || '#059669' : '#4b5563'}
              >
                {item.algorithm}
              </text>
              
              {/* Background bar */}
              <rect
                x={leftMargin}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#e5e7eb"
                rx={4}
              />
              
              {/* Value bar */}
              <rect
                x={leftMargin}
                y={y}
                width={Math.max(width, 2)}
                height={barHeight}
                fill={COLORS[item.algorithm] || '#6b7280'}
                rx={4}
                opacity={isBest ? 1 : 0.7}
              />
              
              {/* Best indicator */}
              {isBest && (
                <text
                  x={leftMargin + Math.max(width, 2) + 8}
                  y={y + barHeight / 2 + 4}
                  fontSize={10}
                  fill="#059669"
                  fontWeight="600"
                >
                  ★ Best
                </text>
              )}
              
              {/* Value label */}
              <text
                x={leftMargin + Math.max(width, 2) - 8}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fontSize={12}
                fontWeight="600"
                fill="white"
              >
                {typeof value === 'number' ? value.toFixed(2) : value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============ MINI GANTT CHART ============
function MiniGanttChart({ gantt, totalTime, algorithm }) {
  if (!gantt || gantt.length === 0) return null;

  const processNames = [...new Set(gantt.map(slot => slot.processId))];
  const chartWidth = 400;
  const chartHeight = processNames.length * 25 + 30;
  const leftMargin = 40;
  const rightMargin = 20;
  const barHeight = 18;
  const rowHeight = 25;
  const actualTotalTime = totalTime || Math.max(...gantt.map(s => s.end), 1);
  const scale = (chartWidth - leftMargin - rightMargin) / actualTotalTime;

  const processColors = {};
  const colorPalette = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  processNames.forEach((name, i) => {
    processColors[name] = colorPalette[i % colorPalette.length];
  });

  return (
    <div className="bg-gray-50 p-3 rounded">
      <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: COLORS[algorithm] || '#6b7280' }}
        />
        {algorithm} Gantt Chart
      </div>
      <svg width={chartWidth} height={chartHeight} className="font-sans">
        {/* Time axis */}
        <line
          x1={leftMargin}
          y1={processNames.length * rowHeight + 5}
          x2={chartWidth - rightMargin}
          y2={processNames.length * rowHeight + 5}
          stroke="#9ca3af"
          strokeWidth={1}
        />

        {/* Time markers */}
        {[0, Math.floor(actualTotalTime / 2), actualTotalTime].map(t => (
          <text
            key={t}
            x={leftMargin + t * scale}
            y={processNames.length * rowHeight + 20}
            textAnchor="middle"
            fontSize={9}
            fill="#6b7280"
          >
            {t}
          </text>
        ))}
        
        {/* Process labels */}
        {processNames.map((name, index) => (
          <text
            key={name}
            x={leftMargin - 5}
            y={index * rowHeight + barHeight / 2 + 4}
            textAnchor="end"
            fontSize={10}
            fill="#4b5563"
          >
            {name}
          </text>
        ))}
        
        {/* Execution bars */}
        {gantt.map((slot, i) => {
          const processIndex = processNames.indexOf(slot.processId);
          const x = leftMargin + slot.start * scale;
          const y = processIndex * rowHeight;
          const width = Math.max((slot.end - slot.start) * scale, 2);
          
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={width}
                height={barHeight}
                fill={processColors[slot.processId]}
                rx={2}
              />
              {/* Time labels on bar */}
              {width > 20 && (
                <text
                  x={x + width / 2}
                  y={y + barHeight / 2 + 3}
                  textAnchor="middle"
                  fontSize={8}
                  fill="white"
                  fontWeight="500"
                >
                  {slot.start}-{slot.end}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============ ALGORITHM CHECKBOX SELECTOR ============
function AlgorithmSelector({ selectedAlgos, onChange }) {
  const toggleAlgorithm = (algoId) => {
    if (selectedAlgos.includes(algoId)) {
      onChange(selectedAlgos.filter(a => a !== algoId));
    } else {
      onChange([...selectedAlgos, algoId]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {AVAILABLE_ALGOS.map((algo) => {
        const isSelected = selectedAlgos.includes(algo.id);
        return (
          <div
            key={algo.id}
            onClick={() => toggleAlgorithm(algo.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isSelected 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[algo.id] || '#6b7280' }}
                  />
                  <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {algo.id}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{algo.name}</p>
                <p className="text-xs text-gray-400">{algo.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ RESULTS TABLE WITH HIGHLIGHTING ============
function ComparisonTable({ comparisons }) {
  if (!comparisons || comparisons.length === 0) return null;

  const metrics = ['avgWaitingTime', 'avgTurnaroundTime', 'avgResponseTime', 'throughput', 'cpuUtilization'];
  const bestValues = {};

  metrics.forEach(metric => {
    const values = comparisons
      .map(c => c.metrics?.[metric])
      .filter(v => v !== undefined && v !== null);

    if (values.length > 0) {
      const lowerIsBetter = !['throughput', 'cpuUtilization'].includes(metric);
      bestValues[metric] = lowerIsBetter ? Math.min(...values) : Math.max(...values);
    }
  });

  const formatValue = (value, metric) => {
    if (value === undefined || value === null) return '-';
    if (metric === 'cpuUtilization') return `${value.toFixed(1)}%`;
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  const isBest = (metric, value) => {
    return value !== undefined && value !== null && value === bestValues[metric];
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Algorithm</th>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
              Avg Waiting
              <span className="block text-xs font-normal text-gray-500">Lower is better</span>
            </th>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
              Avg Turnaround
              <span className="block text-xs font-normal text-gray-500">Lower is better</span>
            </th>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
              Avg Response
              <span className="block text-xs font-normal text-gray-500">Lower is better</span>
            </th>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
              Throughput
              <span className="block text-xs font-normal text-gray-500">Higher is better</span>
            </th>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
              CPU Utilization
              <span className="block text-xs font-normal text-gray-500">Higher is better</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((c, idx) => (
            <tr key={c.algorithm} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[c.algorithm] || '#6b7280' }}
                  />
                  <span className="font-semibold">{c.algorithm}</span>
                </div>
              </td>
              {metrics.map(metric => {
                const value = c.metrics?.[metric];
                const best = isBest(metric, value);
                return (
                  <td
                    key={metric}
                    className={`border border-gray-300 px-4 py-3 ${best ? 'bg-green-100' : ''}`}
                  >
                    <span className={best ? 'text-green-700 font-bold' : ''}>
                      {formatValue(value, metric)}
                    </span>
                    {best && <span className="ml-2 text-green-600">★</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============ RECOMMENDATION CARD ============
function RecommendationCard({ comparisons }) {
  if (!comparisons || comparisons.length === 0) return null;

  const scores = comparisons.map(c => {
    const waiting = c.metrics?.avgWaitingTime ?? Infinity;
    const turnaround = c.metrics?.avgTurnaroundTime ?? Infinity;
    const response = c.metrics?.avgResponseTime ?? Infinity;
    const throughput = c.metrics?.throughput ?? 0;

    const score = waiting + turnaround + response - (throughput * 10);

    return {
      algorithm: c.algorithm,
      score,
      metrics: c.metrics
    };
  });

  scores.sort((a, b) => a.score - b.score);
  const best = scores[0];

  if (!best) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-white/20 p-2 rounded-full">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold">Recommended Algorithm</h3>
          <p className="text-green-100 text-sm">Based on overall performance</p>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-4 mt-4">
        <div className="text-2xl font-bold mb-2">{best.algorithm}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-green-200">Avg Waiting</p>
            <p className="font-semibold">{best.metrics?.avgWaitingTime?.toFixed(2) ?? '-'}</p>
          </div>
          <div>
            <p className="text-green-200">Avg Turnaround</p>
            <p className="font-semibold">{best.metrics?.avgTurnaroundTime?.toFixed(2) ?? '-'}</p>
          </div>
          <div>
            <p className="text-green-200">Throughput</p>
            <p className="font-semibold">{best.metrics?.throughput?.toFixed(2) ?? '-'}</p>
          </div>
          <div>
            <p className="text-green-200">CPU Utilization</p>
            <p className="font-semibold">{best.metrics?.cpuUtilization?.toFixed(1) ?? '-'}%</p>
          </div>
        </div>
      </div>
      
      {scores.length > 1 && (
        <p className="text-green-100 text-sm mt-4">
          Runner-up: <span className="font-semibold">{scores[1].algorithm}</span>
        </p>
      )}
    </div>
  );
}

// ============ ERROR DISPLAY ============
function ErrorsDisplay({ errors }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="text-yellow-800 font-semibold mb-2 flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Some algorithms had issues
      </h3>
      <ul className="space-y-1">
        {errors.map((err, idx) => (
          <li key={idx} className="text-sm text-yellow-700">
            <span className="font-medium">{err.algorithm}:</span> {err.error}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============ MAIN COMPARISON COMPONENT ============
function Comparison() {
  const [processesText, setProcessesText] = useState(JSON.stringify(EXAMPLE_PROCESSES, null, 2));
  const [selectedAlgos, setSelectedAlgos] = useState(['FCFS', 'SJF']);
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (processes.length === 0) {
        throw new Error('At least one process is required.');
      }
      processes.forEach((p, i) => {
        if (!p.id) throw new Error(`Process ${i + 1} is missing 'id'`);
        if (typeof p.arrivalTime !== 'number') throw new Error(`Process ${p.id} has invalid 'arrivalTime'`);
        if (typeof p.burstTime !== 'number' || p.burstTime <= 0) {
          throw new Error(`Process ${p.id} has invalid 'burstTime'`);
        }
      });
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
      
      // Transform API response to expected format
      const transformedData = transformApiResponse(data);
      setResult(transformedData);
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

  const selectAll = () => setSelectedAlgos(AVAILABLE_ALGOS.map(a => a.id));
  const selectNone = () => setSelectedAlgos([]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Algorithm Comparison
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Compare multiple scheduling algorithms side by side
        </p>

        <form onSubmit={handleRunComparison} className="space-y-6">
          {/* Process Input */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Process Configuration
            </h2>
            <textarea
              rows={8}
              value={processesText}
              onChange={(e) => setProcessesText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter processes as JSON array..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Each process needs: id, arrivalTime, burstTime (priority optional)
            </p>
          </section>

          {/* Algorithm Selection */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Select Algorithms ({selectedAlgos.length} selected)
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={selectNone}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <AlgorithmSelector 
              selectedAlgos={selectedAlgos} 
              onChange={setSelectedAlgos} 
            />

            {selectedAlgos.includes('RR') && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <label className="flex items-center gap-3">
                  <span className="text-sm font-medium text-purple-800">
                    Round Robin Time Quantum:
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={timeQuantum}
                    onChange={(e) => setTimeQuantum(e.target.value)}
                    className="border border-purple-300 rounded-lg p-2 w-20 
                               focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </label>
              </div>
            )}
          </section>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || selectedAlgos.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                         disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg 
                         font-semibold shadow-md transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" 
                            stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Comparing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare {selectedAlgos.length} Algorithm{selectedAlgos.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Results */}
        {result && result.comparisons && result.comparisons.length > 0 && (
          <div className="mt-8 space-y-6">
            {/* Algorithm Errors */}
            <ErrorsDisplay errors={result.errors} />

            {/* Recommendation */}
            <RecommendationCard comparisons={result.comparisons} />

            {/* Comparison Table */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Detailed Comparison
              </h2>
              <ComparisonTable comparisons={result.comparisons} />
            </section>

            {/* Bar Charts */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Visual Comparison
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ComparisonBarChart 
                  data={result.comparisons} 
                  metric="avgWaitingTime" 
                  label="Average Waiting Time"
                  lowerIsBetter={true}
                />
                <ComparisonBarChart 
                  data={result.comparisons} 
                  metric="avgTurnaroundTime" 
                  label="Average Turnaround Time"
                  lowerIsBetter={true}
                />
                <ComparisonBarChart 
                  data={result.comparisons} 
                  metric="avgResponseTime" 
                  label="Average Response Time"
                  lowerIsBetter={true}
                />
                <ComparisonBarChart 
                  data={result.comparisons} 
                  metric="throughput" 
                  label="Throughput (processes/unit)"
                  lowerIsBetter={false}
                />
              </div>
            </section>

            {/* Gantt Charts */}
            {result.comparisons.some(c => c.gantt && c.gantt.length > 0) && (
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Execution Timeline
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.comparisons.map(c => (
                    c.gantt && c.gantt.length > 0 && (
                      <MiniGanttChart 
                        key={c.algorithm}
                        gantt={c.gantt}
                        totalTime={c.metrics?.totalTime || 16}
                        algorithm={c.algorithm}
                      />
                    )
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* No results message */}
        {result && (!result.comparisons || result.comparisons.length === 0) && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <strong>No results:</strong> No algorithms completed successfully. Check the errors above.
          </div>
        )}
      </div>
    </div>
  );
}

export default Comparison;