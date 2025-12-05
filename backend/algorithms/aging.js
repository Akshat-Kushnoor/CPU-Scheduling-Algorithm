/**
 * Priority Scheduling with Aging
 * Prevents starvation by increasing priority of waiting processes
 * 
 * @param {Array} processes - Array of process objects with priority
 * @param {Object} options - { agingInterval: number, agingAmount: number, preemptive: boolean }
 * @returns {Object} - Gantt chart and process metrics
 */
const aging = (processes, options = {}) => {
  const {
    agingInterval = 1,      // Time units between aging
    agingAmount = 1,        // Priority increase per aging interval
    preemptive = true       // Whether to preempt on priority change
  } = options;

  const n = processes.length;
  const processList = processes.map(p => ({
    ...p,
    originalPriority: p.priority || 0,
    effectivePriority: p.priority || 0,
    remainingTime: p.burstTime,
    waitingTime: 0,
    startTime: -1,
    completionTime: 0,
    completed: false,
    lastAgedAt: 0
  }));

  const gantt = [];
  let currentTime = 0;
  let completed = 0;
  let lastProcessId = null;
  let lastStartTime = 0;

  const maxTime = Math.max(...processes.map(p => p.arrivalTime)) +
                  processes.reduce((sum, p) => sum + p.burstTime, 0) * 2;

  while (completed < n && currentTime <= maxTime) {
    // Apply aging to waiting processes
    processList.forEach(p => {
      if (p.arrivalTime <= currentTime && !p.completed && p.remainingTime === p.burstTime) {
        // Process is waiting (not started yet or preempted)
        const waitTime = currentTime - Math.max(p.arrivalTime, p.lastAgedAt);
        if (waitTime >= agingInterval) {
          const agingTicks = Math.floor(waitTime / agingInterval);
          p.effectivePriority = Math.max(0, p.effectivePriority - (agingAmount * agingTicks));
          p.lastAgedAt = currentTime;
        }
      }
    });

    // Find available processes
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
      }

      gantt.push({
        processId: 'IDLE',
        start: currentTime,
        end: nextArrival
      });

      currentTime = nextArrival;
      lastProcessId = null;
      continue;
    }

    // Select highest priority process (lower number = higher priority)
    available.sort((a, b) => {
      if (a.effectivePriority !== b.effectivePriority) {
        return a.effectivePriority - b.effectivePriority;
      }
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id);
    });

    const selected = available[0];

    // Context switch check
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

    // Record first response
    if (selected.startTime === -1) {
      selected.startTime = currentTime;
    }

    if (preemptive) {
      // Execute for 1 time unit
      selected.remainingTime--;
      currentTime++;

      // Age other waiting processes
      processList.forEach(p => {
        if (p.id !== selected.id && p.arrivalTime <= currentTime && !p.completed) {
          p.waitingTime++;
          const waitSinceAged = currentTime - p.lastAgedAt;
          if (waitSinceAged >= agingInterval) {
            p.effectivePriority = Math.max(0, p.effectivePriority - agingAmount);
            p.lastAgedAt = currentTime;
          }
        }
      });
    } else {
      // Non-preemptive: execute until completion
      const executeTime = selected.remainingTime;
      selected.remainingTime = 0;
      currentTime += executeTime;
    }

    // Check completion
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

  // Build results
  const results = processList.map(p => ({
    id: p.id,
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    originalPriority: p.originalPriority,
    finalPriority: p.effectivePriority,
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
      if (current.start !== current.end) {
        merged.push(current);
      }
      current = { ...gantt[i] };
    }
  }
  if (current.start !== current.end) {
    merged.push(current);
  }

  return merged;
};

export default aging;