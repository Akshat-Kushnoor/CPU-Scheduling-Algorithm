/**
 * Round Robin (RR) Scheduling Algorithm
 * Preemptive algorithm with time quantum
 * 
 * @param {Array} processes - Array of process objects
 * @param {Object} options - { quantum: number }
 * @returns {Object} - Gantt chart and process metrics
 */
const rr = (processes, options = {}) => {
  const quantum = options.quantum || 2;
  const n = processes.length;
  
  const processList = processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    startTime: -1,
    completionTime: 0,
    lastExecutionTime: -1
  }));

  // Sort by arrival time initially
  processList.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

  const gantt = [];
  const readyQueue = [];
  let currentTime = 0;
  let completed = 0;
  let currentIndex = 0;

  // Add first arriving processes to ready queue
  while (currentIndex < n && processList[currentIndex].arrivalTime <= currentTime) {
    readyQueue.push(processList[currentIndex]);
    currentIndex++;
  }

  // If no process has arrived yet, jump to first arrival
  if (readyQueue.length === 0 && currentIndex < n) {
    currentTime = processList[currentIndex].arrivalTime;
    readyQueue.push(processList[currentIndex]);
    currentIndex++;
  }

  while (completed < n) {
    if (readyQueue.length === 0) {
      // CPU idle - find next arriving process
      const remainingProcesses = processList.filter(p => p.remainingTime > 0);
      if (remainingProcesses.length === 0) break;

      const nextArrival = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      
      gantt.push({
        processId: 'IDLE',
        start: currentTime,
        end: nextArrival
      });
      
      currentTime = nextArrival;

      // Add newly arrived processes
      while (currentIndex < n && processList[currentIndex].arrivalTime <= currentTime) {
        if (processList[currentIndex].remainingTime > 0) {
          readyQueue.push(processList[currentIndex]);
        }
        currentIndex++;
      }
      continue;
    }

    // Get next process from ready queue
    const current = readyQueue.shift();
    
    // Record first response
    if (current.startTime === -1) {
      current.startTime = currentTime;
    }

    // Execute for quantum or remaining time, whichever is smaller
    const executeTime = Math.min(quantum, current.remainingTime);
    const startTime = currentTime;
    const endTime = currentTime + executeTime;

    // Add to Gantt chart
    gantt.push({
      processId: current.id,
      start: startTime,
      end: endTime
    });

    current.remainingTime -= executeTime;
    current.lastExecutionTime = endTime;
    currentTime = endTime;

    // Add newly arrived processes to ready queue (before adding current back)
    while (currentIndex < n && processList[currentIndex].arrivalTime <= currentTime) {
      if (processList[currentIndex].remainingTime > 0) {
        readyQueue.push(processList[currentIndex]);
      }
      currentIndex++;
    }

    // Check if process completed
    if (current.remainingTime === 0) {
      current.completionTime = currentTime;
      completed++;
    } else {
      // Add back to ready queue
      readyQueue.push(current);
    }
  }

  // Build results
  const results = processList.map(p => ({
    id: p.id,
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    priority: p.priority || 0,
    startTime: p.startTime,
    completionTime: p.completionTime,
    turnaroundTime: p.completionTime - p.arrivalTime,
    waitingTime: (p.completionTime - p.arrivalTime) - p.burstTime,
    responseTime: p.startTime - p.arrivalTime
  }));

  // Merge consecutive gantt entries
  const mergedGantt = mergeGanttEntries(gantt);

  return { gantt: mergedGantt, processes: results };
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

export default rr;