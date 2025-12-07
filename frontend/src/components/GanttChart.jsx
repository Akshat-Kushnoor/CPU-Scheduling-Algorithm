// src/components/GanttChart.jsx
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GanttChart
 * Props:
 * - segments: [
 *    { id?, processId, start, end, color? }
 *   ]
 */
export default function GanttChart({ segments = [] }) {
  if (!segments || segments.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        Gantt chart will appear here after running a simulation.
      </section>
    );
  }

  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const minTime = Math.min(...segments.map(s => s.start));
  const maxTime = Math.max(...segments.map(s => s.end));
  const totalTime = Math.max(maxTime - minTime, 1);

  const colors = [
    '#4f46e5', // indigo-600
    '#0ea5e9', // sky-500
    '#f97316', // orange-500
    '#22c55e', // green-500
    '#e11d48', // rose-600
    '#a855f7', // purple-500
    '#facc15', // yellow-400
    '#14b8a6', // teal-500
  ];

  const ticks = buildTicks(minTime, maxTime);

  const handleMouseMove = e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Gantt Chart
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Timeline of CPU allocation (time units: {minTime}–{maxTime})
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/80"
        onMouseMove={handleMouseMove}
      >
        <svg
          viewBox={`0 0 ${totalTime} 40`}
          preserveAspectRatio="none"
          className="h-24 w-full"
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="1.5"
                floodColor="rgba(15,23,42,0.35)"
              />
            </filter>
          </defs>

          {segments.map((segment, index) => {
            const color = segment.color || colors[index % colors.length];
            const width = Math.max(segment.end - segment.start, 0.01);
            return (
              <motion.g
                key={segment.id ?? `${segment.processId}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.rect
                  x={segment.start - minTime}
                  y={10}
                  width={width}
                  height={20}
                  rx={4}
                  fill={color}
                  filter="url(#shadow)"
                  onMouseEnter={() => setHovered(segment)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                />
                <text
                  x={segment.start - minTime + width / 2}
                  y={22}
                  textAnchor="middle"
                  className="select-none"
                  style={{
                    fontSize: 8,
                    fill: 'white',
                    pointerEvents: 'none',
                    fontFamily:
                      'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {segment.processId}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Time axis */}
        <div className="mt-1 flex items-center justify-between text-[0.65rem] text-slate-500 dark:text-slate-400">
          {ticks.map(t => (
            <div
              key={t}
              className="flex flex-1 flex-col items-center text-[0.65rem]"
            >
              <div className="h-2 w-px bg-slate-300 dark:bg-slate-700" />
              <span className="mt-0.5">{t}</span>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y - 32,
              }}
              className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-2 py-1 text-[0.65rem] shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-100">
                {hovered.processId}
              </div>
              <div className="mt-0.5 text-slate-500 dark:text-slate-300">
                <span>Start: {hovered.start}</span>
                <span className="mx-1">•</span>
                <span>End: {hovered.end}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-300">
                Duration: {hovered.end - hovered.start}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function buildTicks(min, max) {
  const span = max - min;
  if (span <= 0) return [min];

  const maxTicks = 12;
  const rawStep = span / maxTicks;
  const step = Math.max(1, Math.round(rawStep));
  const ticks = [];
  for (let t = min; t <= max; t += step) {
    ticks.push(Math.round(t));
  }
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
}