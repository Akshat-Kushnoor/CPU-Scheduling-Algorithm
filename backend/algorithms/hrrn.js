/**
 * Highest Response Ratio Next (HRRN) Scheduling Algorithm
 * Non-preemptive algorithm that considers waiting time
 * Response Ratio = (Waiting Time + Burst Time) / Burst Time
 * 
 * @param {Array} processes - Array of process objects
 * @returns {Object} - Gantt chart and process metrics
 */
const hrrn = (processes) => {
  const n = processes.length;
  const processList = processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    completed: false,
    startTime: -1,
    completionTime: 0
  }));

  const gantt = [];
  const results = [];
  let currentTime = 0;
  let completed = 0;

  while (completed < n) {
    // Find available processes
    const available = processList.filter(
      p => p.arrivalTime <= currentTime && !p.completed
    );

    if (available.length === 0) {
      // No process available, jump to next arrival
      const notCompleted = processList.filter(p => !p.completed);
      if (notCompleted.length === 0) break;

      const nextArrival = Math.min(...notCompleted.map(p => p.arrivalTime));
      
      gantt.push({
        processId: 'IDLE',
        start: currentTime,
        end: nextArrival
      });
      
      currentTime = nextArrival;
      continue;
    }

    // Calculate response ratio for each available process
    const withRatio = available.map(p => {
      const waitingTime = currentTime - p.arrivalTime;
      const responseRatio = (waitingTime + p.burstTime) / p.burstTime;
      return { ...p, responseRatio, currentWaitingTime: waitingTime };
    });

    // Select process with highest response ratio
    // In case of tie, select by arrival time, then by id
    withRatio.sort((a, b) => {
      if (b.responseRatio !== a.responseRatio) return b.responseRatio - a.responseRatio;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });

    const selected = withRatio[0];
    const originalProcess = processList.find(p => p.id === selected.id);

    const startTime = currentTime;
    const endTime = currentTime + selected.burstTime;

    // Record start time
    if (originalProcess.startTime === -1) {
      originalProcess.startTime = startTime;
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
    const responseTime = originalProcess.startTime - selected.arrivalTime;

    results.push({
      id: selected.id,
      arrivalTime: selected.arrivalTime,
      burstTime: selected.burstTime,
      priority: selected.priority || 0,
      startTime: originalProcess.startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
      responseRatio: selected.responseRatio.toFixed(2)
    });

    originalProcess.completed = true;
    originalProcess.completionTime = completionTime;
    completed++;
    currentTime = endTime;
  }

  // Sort results by process id
  results.sort((a, b) => a.id.localeCompare(b.id));

  return { gantt, processes: results };
};

export default hrrn;