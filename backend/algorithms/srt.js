/**
 * Shortest Remaining Time (SRT) / Shortest Remaining Time First (SRTF)
 * Preemptive version of SJF - switches to shorter job when it arrives
 * 
 * @param {Array} processes - Array of process objects
 * @returns {Object} - Gantt chart and process metrics
 */
const srt = (processes) => {
  const n = processes.length;
  const processList = processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    completed: false,
    startTime: -1,
    completionTime: 0
  }));

  const gantt = [];
  let currentTime = 0;
  let completed = 0;
  let lastProcessId = null;
  let lastStartTime = 0;

  // Find the maximum time we might need to simulate
  const maxTime = Math.max(...processes.map(p => p.arrivalTime)) + 
                  processes.reduce((sum, p) => sum + p.burstTime, 0);

  while (completed < n && currentTime <= maxTime) {
    // Find available processes
    const available = processList.filter(
      p => p.arrivalTime <= currentTime && !p.completed && p.remainingTime > 0
    );

    if (available.length === 0) {
      // No process available
      const notCompleted = processList.filter(p => !p.completed);
      if (notCompleted.length === 0) break;

      const nextArrival = Math.min(...notCompleted.map(p => p.arrivalTime));
      
      // Finalize previous gantt entry if exists
      if (lastProcessId !== null && lastProcessId !== 'IDLE') {
        gantt.push({
          processId: lastProcessId,
          start: lastStartTime,
          end: currentTime
        });
      }
      
      lastProcessId = 'IDLE';
      lastStartTime = currentTime;
      currentTime = nextArrival;
      
      if (lastProcessId === 'IDLE') {
        gantt.push({
          processId: 'IDLE',
          start: lastStartTime,
          end: currentTime
        });
        lastProcessId = null;
      }
      continue;
    }

    // Select process with shortest remaining time
    available.sort((a, b) => {
      if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });

    const selected = available[0];

    // Check if we need to switch process (context switch)
    if (lastProcessId !== selected.id) {
      if (lastProcessId !== null) {
        gantt.push({
          processId: lastProcessId,
          start: lastStartTime,
          end: currentTime
        });
      }
      lastProcessId = selected.id;
      lastStartTime = currentTime;
    }

    // Record first response time
    if (selected.startTime === -1) {
      selected.startTime = currentTime;
    }

    // Execute for 1 time unit
    selected.remainingTime--;
    currentTime++;

    // Check if process completed
    if (selected.remainingTime === 0) {
      selected.completed = true;
      selected.completionTime = currentTime;
      completed++;

      // Add to gantt chart
      gantt.push({
        processId: selected.id,
        start: lastStartTime,
        end: currentTime
      });
      lastProcessId = null;
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

  // Merge consecutive same-process gantt entries
  const mergedGantt = mergeGanttEntries(gantt);

  return { gantt: mergedGantt, processes: results };
};

// Helper function to merge consecutive gantt entries
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

export default srt;