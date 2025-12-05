/**
 * Metrics calculation utilities for CPU scheduling
 */

/**
 * Calculate metrics for a single process
 */
export const calculateProcessMetrics = (process) => {
  const { arrivalTime, burstTime, completionTime, startTime } = process;
  
  const turnaroundTime = completionTime - arrivalTime;
  const waitingTime = turnaroundTime - burstTime;
  const responseTime = startTime - arrivalTime;

  return {
    ...process,
    turnaroundTime,
    waitingTime,
    responseTime
  };
};

/**
 * Calculate average metrics from process list
 */
export const calculateAverages = (processes) => {
  if (!processes || processes.length === 0) {
    return {
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
      throughput: 0
    };
  }

  const n = processes.length;
  
  const totalWaitingTime = processes.reduce((sum, p) => sum + (p.waitingTime || 0), 0);
  const totalTurnaroundTime = processes.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0);
  const totalResponseTime = processes.reduce((sum, p) => sum + (p.responseTime || 0), 0);
  
  // Calculate CPU utilization and throughput
  const totalBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0);
  const firstArrival = Math.min(...processes.map(p => p.arrivalTime));
  const lastCompletion = Math.max(...processes.map(p => p.completionTime));
  const totalTime = lastCompletion - firstArrival;

  const cpuUtilization = totalTime > 0 ? (totalBurstTime / totalTime) * 100 : 0;
  const throughput = totalTime > 0 ? n / totalTime : 0;

  return {
    avgWaitingTime: parseFloat((totalWaitingTime / n).toFixed(2)),
    avgTurnaroundTime: parseFloat((totalTurnaroundTime / n).toFixed(2)),
    avgResponseTime: parseFloat((totalResponseTime / n).toFixed(2)),
    cpuUtilization: parseFloat(cpuUtilization.toFixed(2)),
    throughput: parseFloat(throughput.toFixed(4)),
    totalProcesses: n,
    totalBurstTime,
    totalTime,
    firstArrival,
    lastCompletion
  };
};

/**
 * Calculate metrics from algorithm output
 */
export const calculateMetrics = (algorithmOutput) => {
  const { gantt, processes } = algorithmOutput;

  // Ensure all processes have metrics
  const processesWithMetrics = processes.map(p => calculateProcessMetrics(p));

  // Calculate averages
  const averages = calculateAverages(processesWithMetrics);

  // Calculate idle time from gantt chart
  const idleTime = gantt
    .filter(g => g.processId === 'IDLE')
    .reduce((sum, g) => sum + (g.end - g.start), 0);

  return {
    perProcess: processesWithMetrics,
    averages: {
      ...averages,
      idleTime,
      contextSwitches: gantt.filter(g => g.processId !== 'IDLE').length - 1
    }
  };
};

/**
 * Compare metrics between algorithms
 */
export const compareAlgorithms = (results) => {
  const comparison = {
    algorithms: [],
    bestWaitingTime: { algorithm: '', value: Infinity },
    bestTurnaroundTime: { algorithm: '', value: Infinity },
    bestResponseTime: { algorithm: '', value: Infinity },
    bestCpuUtilization: { algorithm: '', value: 0 },
    bestThroughput: { algorithm: '', value: 0 }
  };

  for (const [algorithm, result] of Object.entries(results)) {
    const { averages } = result.metrics;
    
    comparison.algorithms.push({
      name: algorithm,
      avgWaitingTime: averages.avgWaitingTime,
      avgTurnaroundTime: averages.avgTurnaroundTime,
      avgResponseTime: averages.avgResponseTime,
      cpuUtilization: averages.cpuUtilization,
      throughput: averages.throughput
    });

    if (averages.avgWaitingTime < comparison.bestWaitingTime.value) {
      comparison.bestWaitingTime = { algorithm, value: averages.avgWaitingTime };
    }
    if (averages.avgTurnaroundTime < comparison.bestTurnaroundTime.value) {
      comparison.bestTurnaroundTime = { algorithm, value: averages.avgTurnaroundTime };
    }
    if (averages.avgResponseTime < comparison.bestResponseTime.value) {
      comparison.bestResponseTime = { algorithm, value: averages.avgResponseTime };
    }
    if (averages.cpuUtilization > comparison.bestCpuUtilization.value) {
      comparison.bestCpuUtilization = { algorithm, value: averages.cpuUtilization };
    }
    if (averages.throughput > comparison.bestThroughput.value) {
      comparison.bestThroughput = { algorithm, value: averages.throughput };
    }
  }

  return comparison;
};

/**
 * Format metrics for display
 */
export const formatMetrics = (metrics, decimalPlaces = 2) => {
  const format = (value) => {
    if (typeof value === 'number') {
      return parseFloat(value.toFixed(decimalPlaces));
    }
    return value;
  };

  return {
    perProcess: metrics.perProcess.map(p => ({
      ...p,
      waitingTime: format(p.waitingTime),
      turnaroundTime: format(p.turnaroundTime),
      responseTime: format(p.responseTime)
    })),
    averages: Object.fromEntries(
      Object.entries(metrics.averages).map(([key, value]) => [key, format(value)])
    )
  };
};

export default {
  calculateProcessMetrics,
  calculateAverages,
  calculateMetrics,
  compareAlgorithms,
  formatMetrics
};