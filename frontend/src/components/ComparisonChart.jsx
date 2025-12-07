// src/components/ComparisonChart.jsx
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/**
 * ComparisonChart
 * Props:
 * - data: [
 *    { algorithm, avgWT, avgRT, avgTAT }
 *   ]
 * - chartType: 'bar' | 'line'
 */
export default function ComparisonChart({ data = [], chartType = 'bar' }) {
  const hasData = data && data.length > 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Algorithm Comparison
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Average WT, RT, and TAT across algorithms.
        </p>
      </div>

      {!hasData && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Run multiple algorithms to compare their metrics here.
        </p>
      )}

      {hasData && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="algorithm"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  allowDecimals
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderRadius: 8,
                    border: '1px solid #1e293b',
                    fontSize: 11,
                    color: '#e5e7eb',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="avgWT"
                  name="Average WT"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgRT"
                  name="Average RT"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgTAT"
                  name="Average TAT"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="algorithm"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  allowDecimals
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderRadius: 8,
                    border: '1px solid #1e293b',
                    fontSize: 11,
                    color: '#e5e7eb',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="avgWT"
                  name="Average WT"
                  fill="#3b82f6" // blue-500
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="avgRT"
                  name="Average RT"
                  fill="#f97316" // orange-500
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="avgTAT"
                  name="Average TAT"
                  fill="#10b981" // emerald-500
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}