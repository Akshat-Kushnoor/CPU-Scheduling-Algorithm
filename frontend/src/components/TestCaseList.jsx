// src/components/TestCaseList.jsx
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * TestCaseList
 * Props:
 * - testCases: [{ id, name, description?, createdAt? }]
 * - onPreview?: (testCase) => void
 * - onRun?: (testCase) => void
 * - onDelete?: (testCase) => void
 */
export default function TestCaseList({
  testCases = [],
  onPreview,
  onRun,
  onDelete,
}) {
  const hasCases = testCases && testCases.length > 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Saved Test Cases
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Preview, run, or delete pre-defined inputs.
        </p>
      </div>

      {!hasCases && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No test cases yet. Upload or create some to see them listed here.
        </p>
      )}

      {hasCases && (
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="space-y-2"
        >
          <AnimatePresence>
            {testCases.map(test => (
              <motion.li
                key={test.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0 },
                }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-800/70"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-slate-900 dark:text-slate-50">
                      {test.name}
                    </span>
                    {test.createdAt && (
                      <span className="text-[0.6rem] text-slate-500 dark:text-slate-400">
                        {new Date(test.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {test.description && (
                    <p className="mt-0.5 line-clamp-2 text-[0.7rem] text-slate-600 dark:text-slate-300">
                      {test.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPreview?.(test)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[0.65rem] font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => onRun?.(test)}
                    className="rounded-md bg-indigo-600 px-2 py-1 text-[0.65rem] font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Run
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(test)}
                    className="rounded-md border border-rose-300 bg-white px-2 py-1 text-[0.65rem] font-medium text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-rose-700/80 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
                  >
                    Delete
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}