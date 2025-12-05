/**
 * First Come First Serve (FCFS) Scheduling Algorithm
 * Non-preemptive algorithm that executes processes in order of arrival
 * 
 * @param {Array} processes - Array of process objects with id, arrivalTime, burstTime
 * @returns {Object} - Gantt chart and process metrics
 */
const fcfs = (processes) => {
  // Deep copy and sort by arrival time, then by id for stable sort
  const sortedProcesses = [...processes]
    .map(p => ({ ...p, remainingTime: p.burstTime }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id));

  const gantt = [];
  const results = [];
  let currentTime = 0;

  for (const process of sortedProcesses) {
    // If CPU is idle, jump to process arrival time
    if (currentTime < process.arrivalTime) {
      // Add idle time to gantt chart
      if (gantt.length === 0 || gantt[gantt.length - 1].processId !== 'IDLE') {
        gantt.push({
          processId: 'IDLE',
          start: currentTime,
          end: process.arrivalTime
        });
      }
      currentTime = process.arrivalTime;
    }

    const startTime = currentTime;
    const endTime = currentTime + process.burstTime;

    // Add to Gantt chart
    gantt.push({
      processId: process.id,
      start: startTime,
      end: endTime
    });

    // Calculate metrics
    const completionTime = endTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = startTime - process.arrivalTime;

    results.push({
      id: process.id,
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      priority: process.priority || 0,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime
    });

    currentTime = endTime;
  }

  return { gantt, processes: results };
};

export default fcfs;