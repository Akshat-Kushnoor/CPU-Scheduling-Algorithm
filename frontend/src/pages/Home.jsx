// src/pages/Home.jsx
import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="home">
      <div className="hero fade-in">
        <h1>CPU Scheduler Simulator</h1>
        <p>
          Visualize and compare CPU scheduling algorithms with interactive
          Gantt charts and detailed metrics.
        </p>

        <div className="cta-group">
          <Link to="/simulator" className="btn primary bounce">
            Run Simulator
          </Link>
          <Link to="/comparison" className="btn secondary bounce">
            Compare Algorithms
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;