import React, { createContext, useContext, useState } from 'react';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [processes, setProcesses] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [gantt, setGantt] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(false);

  const setResults = ({ gantt: ganttData = [], metrics: metricsData = {} }) => {
    setGantt(ganttData);
    setMetrics(metricsData);
  };

  const value = {
    state: {
      processes,
      selectedAlgorithm,
      gantt,
      metrics,
      loading,
    },
    actions: {
      setProcesses,
      setAlgorithm: setSelectedAlgorithm,
      setResults,
      setLoading,
    },
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return ctx;
};