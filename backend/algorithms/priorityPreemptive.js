const priorityPreemptive = (processes) => {
  const n = processes.length;
  const processList = processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    startTime: -1,
    completionTime: 0,
    completed: false,
    priority: p.priority ?? 0
  }));

  const gantt = [];
  let currentTime = 0;
  let completed = 0;
  let lastProcessId = null;

  while (completed < n) {
    // Select available process with highest priority (lowest number)
    const available = processList.filter(p => p.arrivalTime <= currentTime && !p.completed);
    if (available.length === 0) {
      // CPU idle
      const nextArrival = Math.min(...processList.filter(p => !p.completed).map(p => p.arrivalTime));
      if (gantt.length > 0 && gantt[gantt.length - 1].processId === 'IDLE') {
        gantt[gantt.length - 1].end = nextArrival;
      } else {
        gantt.push({ processId: 'IDLE', start: currentTime, end: nextArrival });
      }
      currentTime = nextArrival;
      continue;
    }

    // Pick highest priority
    available.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });
    const current = available[0];

    // Record first response
    if (current.startTime === -1) current.startTime = currentTime;

    // Context switch / Gantt chart
    if (lastProcessId !== current.id) {
      if (lastProcessId !== null) {
        // Close previous entry
        gantt[gantt.length - 1].end = currentTime;
      }
      gantt.push({ processId: current.id, start: currentTime, end: currentTime + 1 });
      lastProcessId = current.id;
    } else {
      // Extend existing entry
      gantt[gantt.length - 1].end++;
    }

    // Execute 1 time unit
    current.remainingTime--;
    currentTime++;

    if (current.remainingTime === 0) {
      current.completed = true;
      current.completionTime = currentTime;
      completed++;
      lastProcessId = null; // force new Gantt entry next iteration
    }
  }

  const results = processList.map(p => ({
    id: p.id,
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    priority: p.priority,
    startTime: p.startTime,
    completionTime: p.completionTime,
    turnaroundTime: p.completionTime - p.arrivalTime,
    waitingTime: (p.completionTime - p.arrivalTime) - p.burstTime,
    responseTime: p.startTime - p.arrivalTime
  }));

  return { gantt, processes: results };
};

export default priorityPreemptive;