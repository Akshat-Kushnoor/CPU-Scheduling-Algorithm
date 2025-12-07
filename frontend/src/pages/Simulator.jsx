import { useState } from 'react';
import { runSimulation } from '../services/api';

const EXAMPLE_PROCESSES = `[
  { "id": "P1", "arrivalTime": 0, "burstTime": 5, "priority": 2 },
  { "id": "P2", "arrivalTime": 1, "burstTime": 3, "priority": 1 },
  { "id": "P3", "arrivalTime": 2, "burstTime": 8, "priority": 3 }
]`;

const COLORS = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
];

const getColor = (processId, processNames) => {
  const index = processNames.indexOf(processId);
  return COLORS[index % COLORS.length];
};

// ============ CUSTOM GANTT CHART COMPONENT ============
function GanttChart({ ganttSlots, totalTime }) {
  const processNames = [...new Set(ganttSlots.map(slot => slot.processId))];
  const [hoveredSlot, setHoveredSlot] = useState(null);
  
  const chartHeight = processNames.length * 50 + 80;
  const minWidth = 600;
  const chartWidth = Math.max(minWidth, totalTime * 50 + 100);
  const barHeight = 32;
  const rowHeight = 50;
  const leftMargin = 70;
  const topMargin = 30;
  const rightMargin = 40;
  
  const scale = (chartWidth - leftMargin - rightMargin) / totalTime;
  
  return (
    <div className="overflow-x-auto border rounded bg-gray-50 p-4">
      <svg width={chartWidth} height={chartHeight} className="font-sans">
        {/* Background */}
        <rect 
          x={leftMargin} 
          y={topMargin} 
          width={chartWidth - leftMargin - rightMargin} 
          height={processNames.length * rowHeight} 
          fill="#f9fafb" 
          stroke="#e5e7eb"
        />
        
        {/* Horizontal grid lines */}
        {processNames.map((_, index) => (
          <line
            key={`hline-${index}`}
            x1={leftMargin}
            y1={topMargin + (index + 1) * rowHeight}
            x2={chartWidth - rightMargin}
            y2={topMargin + (index + 1) * rowHeight}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}
        
        {/* Vertical grid lines and time labels */}
        {Array.from({ length: totalTime + 1 }).map((_, i) => (
          <g key={`vline-${i}`}>
            <line
              x1={leftMargin + i * scale}
              y1={topMargin}
              x2={leftMargin + i * scale}
              y2={topMargin + processNames.length * rowHeight}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray={i % 5 === 0 ? "0" : "2,2"}
            />
            {(totalTime <= 20 || i % Math.ceil(totalTime / 20) === 0) && (
              <text
                x={leftMargin + i * scale}
                y={topMargin + processNames.length * rowHeight + 20}
                textAnchor="middle"
                fontSize={12}
                fill="#6b7280"
              >
                {i}
              </text>
            )}
          </g>
        ))}
        
        {/* Y-axis labels (Process names) */}
        {processNames.map((name, index) => (
          <text
            key={`label-${name}`}
            x={leftMargin - 10}
            y={topMargin + index * rowHeight + rowHeight / 2 + 4}
            textAnchor="end"
            fontSize={14}
            fontWeight="600"
            fill="#374151"
          >
            {name}
          </text>
        ))}
        
        {/* Execution bars */}
        {ganttSlots.map((slot, index) => {
          const processIndex = processNames.indexOf(slot.processId);
          const x = leftMargin + slot.start * scale;
          const y = topMargin + processIndex * rowHeight + (rowHeight - barHeight) / 2;
          const width = Math.max((slot.end - slot.start) * scale, 1);
          const isHovered = hoveredSlot === index;
          
          return (
            <g 
              key={`bar-${index}`}
              onMouseEnter={() => setHoveredSlot(index)}
              onMouseLeave={() => setHoveredSlot(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Bar shadow */}
              <rect
                x={x + 2}
                y={y + 2}
                width={width}
                height={barHeight}
                fill="rgba(0,0,0,0.1)"
                rx={4}
              />
              {/* Main bar */}
              <rect
                x={x}
                y={y}
                width={width}
                height={barHeight}
                fill={getColor(slot.processId, processNames)}
                rx={4}
                stroke={isHovered ? '#1f2937' : 'transparent'}
                strokeWidth={2}
                opacity={isHovered ? 1 : 0.9}
              />
              {/* Duration text inside bar */}
              {width > 25 && (
                <text
                  x={x + width / 2}
                  y={y + barHeight / 2 + 5}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="500"
                  fill="white"
                >
                  {slot.end - slot.start}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Tooltip */}
        {hoveredSlot !== null && ganttSlots[hoveredSlot] && (
          <g>
            <rect
              x={leftMargin + ganttSlots[hoveredSlot].start * scale}
              y={topMargin - 25}
              width={120}
              height={22}
              fill="#1f2937"
              rx={4}
            />
            <text
              x={leftMargin + ganttSlots[hoveredSlot].start * scale + 60}
              y={topMargin - 10}
              textAnchor="middle"
              fontSize={11}
              fill="white"
            >
              {`${ganttSlots[hoveredSlot].processId}: ${ganttSlots[hoveredSlot].start} → ${ganttSlots[hoveredSlot].end}`}
            </text>
          </g>
        )}
        
        {/* X-axis label */}
        <text
          x={(chartWidth + leftMargin - rightMargin) / 2}
          y={topMargin + processNames.length * rowHeight + 45}
          textAnchor="middle"
          fontSize={13}
          fontWeight="500"
          fill="#4b5563"
        >
          Time Units
        </text>
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {processNames.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: getColor(name, processNames) }}
            />
            <span className="text-sm font-medium text-gray-700">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ METRICS TABLE COMPONENT ============
function MetricsTable({ processMetrics }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-3 text-left font-semibold">Process</th>
            <th className="border border-gray-300 p-3 text-left font-semibold">Arrival</th>
            <th className="border border-gray-300 p-3 text-left font-semibold">Burst</th>
            <th className="border border-gray-300 p-3 text-left font-semibold">Completion</th>
            <th className="border border-gray-300 p-3 text-left font-semibold">Turnaround</th>
            <th className="border border-gray-300 p-3 text-left font-semibold">Waiting</th>
            <th className="border border-gray-300 p-3 text-left font-semibold">Response</th>
          </tr>
        </thead>
        <tbody>
          {processMetrics.map((pm, idx) => (
            <tr key={pm.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 p-3 font-medium">{pm.id}</td>
              <td className="border border-gray-300 p-3">{pm.arrivalTime}</td>
              <td className="border border-gray-300 p-3">{pm.burstTime}</td>
              <td className="border border-gray-300 p-3">{pm.completionTime}</td>
              <td className="border border-gray-300 p-3">{pm.turnaroundTime}</td>
              <td className="border border-gray-300 p-3">{pm.waitingTime}</td>
              <td className="border border-gray-300 p-3">{pm.responseTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============ AVERAGE METRICS CARDS ============
function AverageMetrics({ metrics }) {
  const cards = [
    { label: 'Avg Turnaround Time', value: metrics.avgTurnaroundTime, color: 'blue' },
    { label: 'Avg Waiting Time', value: metrics.avgWaitingTime, color: 'green' },
    { label: 'Avg Response Time', value: metrics.avgResponseTime, color: 'purple' },
    { label: 'Total Time', value: metrics.totalTime, color: 'orange', isInteger: true },
    { label: 'CPU Utilization', value: metrics.cpuUtilization, color: 'cyan', suffix: '%' },
    { label: 'Throughput', value: metrics.throughput, color: 'pink', suffix: ' proc/unit' },
  ];
  
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    pink: 'bg-pink-50 text-pink-600',
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        card.value !== undefined && (
          <div key={card.label} className={`${colorClasses[card.color].split(' ')[0]} p-4 rounded-lg`}>
            <p className="text-xs text-gray-600 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${colorClasses[card.color].split(' ')[1]}`}>
              {card.isInteger ? card.value : card.value?.toFixed(2)}
              {card.suffix || ''}
            </p>
          </div>
        )
      ))}
    </div>
  );
}

// ============ MAIN SIMULATOR COMPONENT ============
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
        throw new Error('Input must be a JSON array');
      }
      if (processes.length === 0) {
        throw new Error('At least one process is required');
      }
      // Validate process structure
      processes.forEach((p, i) => {
        if (!p.id) throw new Error(`Process ${i + 1} is missing 'id'`);
        if (typeof p.arrivalTime !== 'number') throw new Error(`Process ${p.id} has invalid 'arrivalTime'`);
        if (typeof p.burstTime !== 'number' || p.burstTime <= 0) {
          throw new Error(`Process ${p.id} has invalid 'burstTime'`);
        }
      });
    } catch (err) {
      setError(err.message || 'Invalid JSON format');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        processes,
        algorithm,
        ...(algorithm === 'RR' ? { timeQuantum: Number(timeQuantum) } : {}),
      };
      const data = await runSimulation(payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const ganttSlots = result?.gantt || [];

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
        CPU Scheduler Simulator
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Visualize and compare different CPU scheduling algorithms
      </p>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleRunSimulation} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Process Configuration (JSON)
            </label>
            <textarea
              rows={8}
              value={processesText}
              onChange={(e) => setProcessesText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter processes as JSON array..."
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="FCFS">First Come First Serve (FCFS)</option>
                <option value="SJF">Shortest Job First (SJF)</option>
                <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
                <option value="PRIORITY">Priority Scheduling</option>
                <option value="RR">Round Robin (RR)</option>
              </select>
            </div>
            
            {algorithm === 'RR' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Quantum
                </label>
                <input
                  type="number"
                  min={1}
                  value={timeQuantum}
                  onChange={(e) => setTimeQuantum(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg w-24 focus:ring-2 
                             focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                         disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg 
                         font-medium transition-colors shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" 
                            stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running...
                </span>
              ) : 'Run Simulation'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}
        </form>
      </div>

      {result && (
        <div className="space-y-8">
          {/* Gantt Chart Section */}
          {ganttSlots.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Gantt Chart - {algorithm}
              </h2>
              <GanttChart 
                ganttSlots={ganttSlots} 
                totalTime={result.metrics?.totalTime || 0} 
              />
            </div>
          )}

          {/* Process Metrics Table */}
          {result.processMetrics && result.processMetrics.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Process Metrics
              </h2>
              <MetricsTable processMetrics={result.processMetrics} />
            </div>
          )}

          {/* Average Metrics Cards */}
          {result.metrics && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Summary Statistics
              </h2>
              <AverageMetrics metrics={result.metrics} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Simulator;