import React from 'react';
import { NavLink } from 'react-router-dom';

const navLinkClass =
  'px-3 py-1 rounded-md text-sm font-medium transition-colors border border-transparent';
const activeClass =
  'bg-primary text-white border-primary';
const inactiveClass =
  'text-gray-700 hover:text-primary hover:bg-red-50 dark:text-gray-200 dark:hover:text-white dark:hover:bg-red-900/30';

const Navbar = ({ theme, toggleTheme }) => {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-sm">
            CPU
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              CPU Scheduler Simulator
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Visualize and compare scheduling algorithms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink
              to="/simulate"
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Simulate
            </NavLink>
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Compare
            </NavLink>
            <NavLink
              to="/testcases"
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              Testcases
            </NavLink>
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              // Sun icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 3.5a.75.75 0 0 1 .75.75V6a.75.75 0 0 1-1.5 0V4.25A.75.75 0 0 1 10 3.5Zm0 7a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm5.657-5.657a.75.75 0 0 1 0 1.06L14.72 7.79a.75.75 0 1 1-1.06-1.06l.937-.938a.75.75 0 0 1 1.06 0Zm-11.314 0a.75.75 0 0 1 1.06 0l.938.938A.75.75 0 0 1 5.28 7.79L4.343 6.853a.75.75 0 0 1 0-1.06ZM3.5 10a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H4.25A.75.75 0 0 1 3.5 10Zm9.25 0a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H13.5a.75.75 0 0 1-.75-.75Zm-.84 3.16a.75.75 0 0 1 1.06 0l.938.938a.75.75 0 1 1-1.06 1.06l-.938-.938a.75.75 0 0 1 0-1.06Zm-7.78 0a.75.75 0 0 1 1.06 0l.938.938a.75.75 0 1 1-1.06 1.06l-.938-.938a.75.75 0 0 1 0-1.06ZM10 14a.75.75 0 0 1 .75.75V16.5a.75.75 0 0 1-1.5 0v-1.75A.75.75 0 0 1 10 14Z" />
              </svg>
            ) : (
              // Moon icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a.75.75 0 0 0-.98-.98A9.5 9.5 0 1 0 18.273 14.273a.75.75 0 0 0-.98-.98Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="sm:hidden border-t border-gray-200 dark:border-gray-800 px-2 pb-2 flex gap-1">
        <NavLink
          to="/simulate"
          className={({ isActive }) =>
            `flex-1 text-center text-xs py-1 mt-1 rounded-md ${isActive ? activeClass : inactiveClass}`
          }
        >
          Simulate
        </NavLink>
        <NavLink
          to="/compare"
          className={({ isActive }) =>
            `flex-1 text-center text-xs py-1 mt-1 rounded-md ${isActive ? activeClass : inactiveClass}`
          }
        >
          Compare
        </NavLink>
        <NavLink
          to="/testcases"
          className={({ isActive }) =>
            `flex-1 text-center text-xs py-1 mt-1 rounded-md ${isActive ? activeClass : inactiveClass}`
          }
        >
          Testcases
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;