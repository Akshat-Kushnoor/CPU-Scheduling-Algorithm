/**
 * Priority Scheduling (Preemptive)
 * Lower priority number = Higher priority
 * Preempts when a higher priority process arrives
 * 
 * @param {Array} processes - Array of process objects with priority
 * @param {Object} options - { preemptive: boolean }
 * @returns {Object} - Gantt chart and process metrics
 */
const priorityPreemptive = (processes, options = {}) => {
  const { preemptive = true } = options;

  const n = processes.length;
  const processList = processes.map(p => ({
    ...p,
    priority: p.priority ?? 0,
    remainingTime: p.burstTime,
    startTime: -1,
    completionTime: 0,
    completed: false
  }));

  const gantt = [];
  let currentTime = 0;
  let completed = 0;
  let lastProcessId = null;
  let lastStartTime = 0;

  if (!preemptive) {
    // Non-preemptive priority scheduling
    while (completed < n) {
      const available = processList.filter(
        p => p.arrivalTime <= currentTime && !p.completed
      );

      if (available.length === 0) {
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

      // Select highest priority (lowest number)
      available.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.id.localeCompare(b.id);
      });

      const selected = available[0];
      selected.startTime = currentTime;

      gantt.push({
        processId: selected.id,
        start: currentTime,
        end: currentTime + selected.burstTime
      });

      currentTime += selected.burstTime;
      selected.completionTime = currentTime;
      selected.completed = true;
      completed++;
    }
  } else {
    // Preemptive priority scheduling
    while (completed < n) {
      const available = processList.filter(
        p => p.arrivalTime <= currentTime && !p.completed
      );

      if (available.length === 0) {
        const notCompleted = processList.filter(p => !p.completed);
        if (notCompleted.length === 0) break;

        const nextArrival = Math.min(...notCompleted.map(p => p.arrivalTime));
        
        if (lastProcessId !== null) {
          gantt.push({
            processId: lastProcessId,
            start: lastStartTime,
            end: currentTime
          });
          lastProcessId = null;
        }

        gantt.push({
          processId: 'IDLE',
          start: currentTime,
          end: nextArrival
        });

        currentTime = nextArrival;
        continue;
      }

      // Select highest priority
      available.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.id.localeCompare(b.id);
      });

      const selected = available[0];

      // Context switch
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

      // First response
      if (selected.startTime === -1) {
        selected.startTime = currentTime;
      }

      // Execute 1 unit
      selected.remainingTime--;
      currentTime++;

      if (selected.remainingTime === 0) {
        selected.completed = true;
        selected.completionTime = currentTime;
        completed++;

        gantt.push({
          processId: selected.id,
          start: lastStartTime,
          end: currentTime
        });
        lastProcessId = null;
      }
    }
  }

  // Build results
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

export default priorityPreemptive;