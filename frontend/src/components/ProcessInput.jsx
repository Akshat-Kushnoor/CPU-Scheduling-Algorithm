// src/components/ProcessInput.jsx
import React, { useEffect, useState } from 'react';

/**
 * ProcessInput
 * Props:
 * - value: array of { id, arrivalTime, burstTime, priority? }
 * - onChange: (rows) => void
 */
export default function ProcessInput({ value = [], onChange }) {
  const [rows, setRows] = useState(
    value.length > 0
      ? value
      : [{ id: 'P1', arrivalTime: 0, burstTime: 5, priority: '' }]
  );

  useEffect(() => {
    if (!value) return;
    if (value.length !== rows.length) {
      setRows(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    onChange?.(rows);
  }, [rows, onChange]);

  const handleFieldChange = (index, field, rawValue) => {
    setRows(prev =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]:
                field === 'id' || rawValue === ''
                  ? rawValue
                  : Number(rawValue),
            }
          : row
      )
    );
  };

  const addRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: `P${prev.length + 1}`,
        arrivalTime: 0,
        burstTime: 1,
        priority: '',
      },
    ]);
  };

  const removeRow = index => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setRows([]);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Processes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define arrival, burst, and optional priority for each process.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Process
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px] space-y-2">
          <div className="grid grid-cols-[1.2fr,1fr,1fr,1fr,auto] gap-3 px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>ID</span>
            <span>Arrival Time</span>
            <span>Burst Time</span>
            <span>Priority (optional)</span>
            <span className="sr-only">Actions</span>
          </div>

          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.2fr,1fr,1fr,1fr,auto] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-1 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-800/60"
            >
              <input
                type="text"
                value={row.id}
                onChange={e => handleFieldChange(index, 'id', e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="P1"
              />
              <input
                type="number"
                min="0"
                value={row.arrivalTime}
                onChange={e =>
                  handleFieldChange(index, 'arrivalTime', e.target.value)
                }
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <input
                type="number"
                min="1"
                value={row.burstTime}
                onChange={e =>
                  handleFieldChange(index, 'burstTime', e.target.value)
                }
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <input
                type="number"
                min="0"
                value={row.priority}
                onChange={e =>
                  handleFieldChange(index, 'priority', e.target.value)
                }
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Optional"
              />
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="rounded-md p-1 text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                  aria-label="Remove process"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
              No processes defined. Click &ldquo;Add Process&rdquo; to begin.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}