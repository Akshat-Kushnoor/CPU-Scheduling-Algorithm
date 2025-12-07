// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Simulator from './pages/Simulator';
import Comparison from './pages/Comparison';
import TestCases from './pages/TestCases';

function App() {
return (
  <Router>
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <header className="w-full bg-white shadow">
        <nav className="flex gap-6 px-6 py-4 text-lg font-medium">
          <Link className="hover:text-blue-600 transition" to="/">Home</Link>
          <Link className="hover:text-blue-600 transition" to="/simulator">Simulator</Link>
          <Link className="hover:text-blue-600 transition" to="/comparison">Comparison</Link>
          <Link className="hover:text-blue-600 transition" to="/test-cases">Test Cases</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-6">
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