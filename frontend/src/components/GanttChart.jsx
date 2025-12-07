import React from 'react';

const GanttChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Run a simulation to see the Gantt chart.
      </div>
    );
  }

  const totalDuration =
    (data[data.length - 1].end ?? 0) - (data[0].start ?? 0) || 1;

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3">
        Gantt Chart
      </h3>
      <div className="flex flex-col gap-2">
        <div className="flex w-full overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {data.map((segment, index) => {
            const duration = (segment.end ?? 0) - (segment.start ?? 0) || 1;
            const width = (duration / totalDuration) * 100;
            const isIdle = segment.pid === 'IDLE' || segment.pid === 0;
            return (
              <div
                key={index}
                className={`relative flex items-center justify-center text-[10px] sm:text-xs border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                  isIdle
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    : 'bg-secondary/40 dark:bg-primary/40 text-gray-900 dark:text-white'
                }`}
                style={{ width: `${width}%` }}
              >
                <span className="font-medium">
                  {isIdle ? 'Idle' : `P${segment.pid}`}
                </span>
                <span className="absolute left-1 bottom-0.5 text-[9px] text-gray-600 dark:text-gray-300">
                  {segment.start}
                </span>
                <span className="absolute right-1 bottom-0.5 text-[9px] text-gray-600 dark:text-gray-300">
                  {segment.end}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
          <span>Start: {data[0].start}</span>
          <span>End: {data[data.length - 1].end}</span>
          <span>Total: {totalDuration}</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;