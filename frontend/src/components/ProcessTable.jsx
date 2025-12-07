import React from 'react';

const ProcessTable = ({ processes, onChange, onAdd, onRemove, showPriority = true }) => {
  const handleChange = (index, field, rawValue) => {
    const value = rawValue === '' ? '' : Number(rawValue);
    const updated = processes.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange(updated);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/80">
        <h2 className="text-sm font-medium text-gray-800 dark:text-gray-100">
          Processes
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-primary text-white hover:bg-primary/90"
        >
          +
          <span>Add process</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="text-left text-gray-600 dark:text-gray-300">
              <th className="px-3 py-2 font-medium">PID</th>
              <th className="px-3 py-2 font-medium">Arrival Time</th>
              <th className="px-3 py-2 font-medium">Burst Time</th>
              {showPriority && (
                <th className="px-3 py-2 font-medium">Priority</th>
              )}
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes.length === 0 && (
              <tr>
                <td
                  colSpan={showPriority ? 5 : 4}
                  className="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No processes added yet. Click &quot;Add process&quot; to begin.
                </td>
              </tr>
            )}
            {processes.map((p, index) => (
              <tr
                key={index}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    className="w-16 sm:w-20 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs sm:text-sm"
                    value={p.pid ?? index + 1}
                    onChange={(e) => handleChange(index, 'pid', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    className="w-20 sm:w-24 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs sm:text-sm"
                    value={p.arrivalTime ?? 0}
                    onChange={(e) =>
                      handleChange(index, 'arrivalTime', e.target.value)
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="1"
                    className="w-20 sm:w-24 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs sm:text-sm"
                    value={p.burstTime ?? 1}
                    onChange={(e) =>
                      handleChange(index, 'burstTime', e.target.value)
                    }
                  />
                </td>
                {showPriority && (
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      className="w-20 sm:w-24 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs sm:text-sm"
                      value={p.priority ?? 0}
                      onChange={(e) =>
                        handleChange(index, 'priority', e.target.value)
                      }
                    />
                  </td>
                )}
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessTable;