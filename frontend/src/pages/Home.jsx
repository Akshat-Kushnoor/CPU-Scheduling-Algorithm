// src/pages/Home.jsx
import { Link } from 'react-router-dom';

function Home() {
return (
  <section className="home py-20 px-6 flex items-center justify-center">
    <div className="hero fade-in max-w-3xl text-center">
      <h1 className="text-4xl font-extrabold mb-4">
        CPU Scheduler Simulator
      </h1>

      <p className="text-gray-600 text-lg mb-8">
        Visualize and compare CPU scheduling algorithms with interactive
        Gantt charts and detailed metrics.
      </p>

      <div className="cta-group flex items-center justify-center gap-4">
        <Link
          to="/simulator"
          className="btn primary bounce bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Run Simulator
        </Link>

        <Link
          to="/comparison"
          className="btn secondary bounce bg-gray-200 text-gray-800 px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
        >
          Compare Algorithms
        </Link>
      </div>
    </div>
  </section>
);

}

export default Home;