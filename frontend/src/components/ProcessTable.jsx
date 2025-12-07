// src/components/ProcessTable.jsx
import React, { useMemo, useState } from 'react';

/**
 * ProcessTable
 * Props:
 * - processes: [
 *    { id, arrivalTime, burstTime, priority, startTime, endTime }
 *   ]
 * - onRowClick?: (process) => void
 */
export default function ProcessTable({ processes = [], onRowClick }) {
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'asc',
  });

  const sorted = useMemo(() => {
    const data = [...processes];
    const { key, direction } = sortConfig;
    data.sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      if (typeof va === 'number' && typeof vb === 'number') {
        return direction === 'asc' ? va - vb : vb - va;
      }

      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return direction === 'asc' ? -1 : 1;
      if (sa > sb) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [processes, sortConfig]);

  const requestSort = key => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'arrivalTime', label: 'Arrival' },
    { key: 'burstTime', label: 'Burst' },
    { key: 'priority', label: 'Priority' },
    { key: 'startTime', label: 'Start' },
    { key: 'endTime', label: 'End' },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Process Table
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sorted by {columns.find(c => c.key === sortConfig.key)?.label}{' '}
          ({sortConfig.direction}).
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/80">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  onClick={() => requestSort(col.key)}
                  className="cursor-pointer px-3 py-2 text-left text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span className="text-[0.55rem]">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {sorted.map(proc => (
              <tr
                key={proc.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => onRowClick?.(proc)}
              >
                <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                  {proc.id}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">
                  {proc.arrivalTime}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">
                  {proc.burstTime}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">
                  {proc.priority ?? '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">
                  {proc.startTime ?? '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">
                  {proc.endTime ?? '—'}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                >
                  No processes to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}