// src/components/Navbar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const navLinks = ['Home', 'Simulator', 'Comparison', 'Test Cases'];

export default function Navbar({ current = 'Home', onNavClick }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white shadow">
            CS
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              CPU Scheduler
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Algorithm Visualizer
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(link => (
            <button
              key={link}
              type="button"
              onClick={() => onNavClick?.(link)}
              className={[
                'text-sm font-medium transition-colors',
                link === current
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
              ].join(' ')}
            >
              {link}
            </button>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Open main menu</span>
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${
                open ? 'translate-y-1.5 rotate-45' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition-opacity ${
                open ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${
                open ? '-translate-y-1.5 -rotate-45' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white/95 px-4 pb-3 pt-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
          <div className="space-y-1">
            {navLinks.map(link => (
              <button
                key={link}
                type="button"
                onClick={() => {
                  onNavClick?.(link);
                  setOpen(false);
                }}
                className={[
                  'block w-full rounded-md px-3 py-2 text-left text-sm font-medium',
                  link === current
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                ].join(' ')}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.nav>
  );
}