/**
 * Shortest Job First (SJF) Scheduling Algorithm
 * Non-preemptive algorithm that selects the process with shortest burst time
 * 
 * @param {Array} processes - Array of process objects
 * @returns {Object} - Gantt chart and process metrics
 */
const sjf = (processes) => {
  const n = processes.length;
  const processList = processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    completed: false,
    startTime: -1
  }));

  const gantt = [];
  const results = [];
  let currentTime = 0;
  let completed = 0;

  while (completed < n) {
    // Find available processes (arrived and not completed)
    const available = processList.filter(
      p => p.arrivalTime <= currentTime && !p.completed
    );

    if (available.length === 0) {
      // No process available, find next arrival
      const nextArrival = Math.min(
        ...processList.filter(p => !p.completed).map(p => p.arrivalTime)
      );
      
      // Add idle time
      gantt.push({
        processId: 'IDLE',
        start: currentTime,
        end: nextArrival
      });
      
      currentTime = nextArrival;
      continue;
    }

    // Select process with shortest burst time
    // In case of tie, select by arrival time, then by id
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });

    const selected = available[0];
    const startTime = currentTime;
    const endTime = currentTime + selected.burstTime;

    // Record start time for response time calculation
    if (selected.startTime === -1) {
      selected.startTime = startTime;
    }

    // Add to Gantt chart
    gantt.push({
      processId: selected.id,
      start: startTime,
      end: endTime
    });

    // Calculate metrics
    const completionTime = endTime;
    const turnaroundTime = completionTime - selected.arrivalTime;
    const waitingTime = turnaroundTime - selected.burstTime;
    const responseTime = selected.startTime - selected.arrivalTime;

    results.push({
      id: selected.id,
      arrivalTime: selected.arrivalTime,
      burstTime: selected.burstTime,
      priority: selected.priority || 0,
      startTime: selected.startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime
    });

    selected.completed = true;
    completed++;
    currentTime = endTime;
  }

  // Sort results by process id for consistent output
  results.sort((a, b) => a.id.localeCompare(b.id));

  return { gantt, processes: results };
};

export default sjf;