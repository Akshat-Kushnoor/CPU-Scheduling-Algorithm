/**
 * Multilevel Feedback Queue (MLFQ) Scheduling Algorithm
 * Multiple queues with different priorities and time quanta
 * Processes move to lower priority queues after using their quantum
 * 
 * @param {Array} processes - Array of process objects
 * @param {Object} options - { levels: [{ quantum, priority }] }
 * @returns {Object} - Gantt chart and process metrics
 */
const feedback = (processes, options = {}) => {
  // Default 3-level feedback queue
  const levels = options.levels || [
    { quantum: 1, priority: 0 },   // Highest priority, smallest quantum
    { quantum: 2, priority: 1 },
    { quantum: 4, priority: 2 }    // Lowest priority, largest quantum
  ];

  const numLevels = levels.length;
  const n = processes.length;

  const processList = processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    currentLevel: 0,
    startTime: -1,
    completionTime: 0,
    quantumRemaining: levels[0].quantum
  }));

  // Sort by arrival time
  processList.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

  // Initialize queues for each level
  const queues = levels.map(() => []);
  const gantt = [];
  let currentTime = 0;
  let completed = 0;
  let currentIndex = 0;

  // Helper function to add newly arrived processes to highest priority queue
  const addArrivedProcesses = (time) => {
    while (currentIndex < n && processList[currentIndex].arrivalTime <= time) {
      const process = processList[currentIndex];
      if (process.remainingTime > 0) {
        process.quantumRemaining = levels[0].quantum;
        queues[0].push(process);
      }
      currentIndex++;
    }
  };

  // Helper to find next non-empty queue
  const getNextProcess = () => {
    for (let i = 0; i < numLevels; i++) {
      if (queues[i].length > 0) {
        return { level: i, process: queues[i].shift() };
      }
    }
    return null;
  };

  // Helper to check if any process is waiting
  const hasWaitingProcess = () => {
    return queues.some(q => q.length > 0) || currentIndex < n;
  };

  // Add initial processes
  addArrivedProcesses(currentTime);

  while (completed < n) {
    // Get next process to execute
    const next = getNextProcess();

    if (!next) {
      // No process in any queue, find next arrival
      const remaining = processList.filter(p => p.remainingTime > 0);
      if (remaining.length === 0) break;

      const nextArrival = Math.min(
        ...processList
          .filter((p, i) => i >= currentIndex)
          .map(p => p.arrivalTime)
      );

      if (nextArrival > currentTime) {
        gantt.push({
          processId: 'IDLE',
          start: currentTime,
          end: nextArrival
        });
        currentTime = nextArrival;
      }
      
      addArrivedProcesses(currentTime);
      continue;
    }

    const { level, process } = next;
    const quantum = levels[level].quantum;

    // Record first response
    if (process.startTime === -1) {
      process.startTime = currentTime;
    }

    // Execute for quantum or remaining time
    const executeTime = Math.min(quantum, process.remainingTime);
    const startTime = currentTime;
    const endTime = currentTime + executeTime;

    gantt.push({
      processId: process.id,
      start: startTime,
      end: endTime
    });

    process.remainingTime -= executeTime;
    currentTime = endTime;

    // Add newly arrived processes (higher priority)
    addArrivedProcesses(currentTime);

    if (process.remainingTime === 0) {
      // Process completed
      process.completionTime = currentTime;
      completed++;
    } else {
      // Move to next lower priority queue (or stay in last queue)
      const nextLevel = Math.min(level + 1, numLevels - 1);
      process.currentLevel = nextLevel;
      process.quantumRemaining = levels[nextLevel].quantum;
      queues[nextLevel].push(process);
    }
  }

  // Build results
  const results = processList.map(p => ({
    id: p.id,
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    priority: p.priority || 0,
    finalLevel: p.currentLevel,
    startTime: p.startTime,
    completionTime: p.completionTime,
    turnaroundTime: p.completionTime - p.arrivalTime,
    waitingTime: (p.completionTime - p.arrivalTime) - p.burstTime,
    responseTime: p.startTime - p.arrivalTime
  }));

  const mergedGantt = mergeGanttEntries(gantt);

  return { gantt: mergedGantt, processes: results, levels };
};

const mergeGanttEntries = (gantt) => {
  if (gantt.length === 0) return [];
  
  const merged = [];
  let current = { ...gantt[0] };

  for (let i = 1; i < gantt.length; i++) {
    if (gantt[i].processId === current.processId && gantt[i].start === current.end) {
      current.end = gantt[i].end;
    } else {
      merged.push(current);
      current = { ...gantt[i] };
    }
  }
  merged.push(current);

  return merged;
};

export default feedback;