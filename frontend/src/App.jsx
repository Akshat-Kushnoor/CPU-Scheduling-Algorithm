// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Simulator from './pages/Simulator';
import Comparison from './pages/Comparison';
import TestCases from './pages/TestCases';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/simulator">Simulator</Link>
            <Link to="/comparison">Comparison</Link>
            <Link to="/test-cases">Test Cases</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/test-cases" element={<TestCases />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;