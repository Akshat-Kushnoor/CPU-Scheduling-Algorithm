// src/components/MetricsDisplay.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * MetricsDisplay
 * Props:
 * - metrics: {
 *     averageWaitingTime,
 *     averageTurnaroundTime,
 *     averageResponseTime
 *   }
 */
export default function MetricsDisplay({ metrics = {} }) {
  const items = [
    {
      key: 'averageWaitingTime',
      label: 'Average Waiting Time (WT)',
      unit: 'time units',
    },
    {
      key: 'averageTurnaroundTime',
      label: 'Average Turnaround Time (TAT)',
      unit: 'time units',
    },
    {
      key: 'averageResponseTime',
      label: 'Average Response Time (RT)',
      unit: 'time units',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Metrics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Averages computed over all processes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map(item => {
          const value = metrics[item.key];
          return (
            <div
              key={item.key}
              className="flex flex-col rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-800/60"
            >
              <span className="mb-1 text-[0.7rem] font-medium text-slate-600 dark:text-slate-300">
                {item.label}
              </span>
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {value !== undefined && !Number.isNaN(value)
                  ? Number(value).toFixed(2)
                  : '—'}
              </span>
              <span className="mt-0.5 text-[0.65rem] text-slate-500 dark:text-slate-400">
                {item.unit}
              </span>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}