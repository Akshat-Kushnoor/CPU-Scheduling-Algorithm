// src/components/AlgorithmSelector.jsx
import React from 'react';
import { motion } from 'framer-motion';

const algorithms = [
  'FCFS',
  'SJF',
  'SRT',
  'RR',
  'HRRN',
  'Feedback',
  'Aging',
  'Priority Preemptive',
];

/**
 * AlgorithmSelector
 * Props:
 * - selected: string
 * - onSelect: (name: string) => void
 */
export default function AlgorithmSelector({ selected, onSelect }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Scheduling Algorithm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose an algorithm to simulate.
          </p>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 12 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.05 },
          },
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {algorithms.map(name => {
          const isSelected = name === selected;
          return (
            <motion.button
              key={name}
              type="button"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect?.(name)}
              className={[
                'flex h-full flex-col rounded-lg border px-3 py-2 text-left text-xs shadow-sm transition-colors',
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/80 text-indigo-800 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-100'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:bg-slate-800',
              ].join(' ')}
            >
              <span className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide">
                {name}
              </span>
              <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                {getAlgorithmSubtitle(name)}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}

function getAlgorithmSubtitle(name) {
  switch (name) {
    case 'FCFS':
      return 'First-Come First-Served (non-preemptive)';
    case 'SJF':
      return 'Shortest Job First (non-preemptive)';
    case 'SRT':
      return 'Shortest Remaining Time (preemptive)';
    case 'RR':
      return 'Round Robin with fixed time quantum';
    case 'HRRN':
      return 'Highest Response Ratio Next';
    case 'Feedback':
      return 'Multilevel feedback queues';
    case 'Aging':
      return 'Priority with aging to avoid starvation';
    case 'Priority Preemptive':
      return 'Preemptive fixed priority scheduling';
    default:
      return '';
  }
}