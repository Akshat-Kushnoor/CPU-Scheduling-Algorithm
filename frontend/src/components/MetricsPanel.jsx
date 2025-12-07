import React from 'react';

const MetricsPanel = ({ metrics }) => {
  const entries = metrics ? Object.entries(metrics) : [];

  if (!entries.length) {
    return null;
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
        Metrics
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-md border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/70 px-3 py-2"
          >
            <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {key.replace(/[_-]/g, ' ')}
            </dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100 font-medium">
              {typeof value === 'number' ? value.toFixed(2) : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default MetricsPanel;