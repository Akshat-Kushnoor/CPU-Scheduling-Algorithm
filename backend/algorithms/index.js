import fcfs from './fcfs.js';
import sjf from './sjf.js';
import srt from './srt.js';
import rr from './rr.js';
import hrrn from './hrrn.js';
import feedback from './feedback.js';
import aging from './aging.js';
import priorityPreemptive from './priorityPreemptive.js';

const algorithms = {
  FCFS: fcfs,
  SJF: sjf,
  SRT: srt,
  RR: rr,
  HRRN: hrrn,
  FEEDBACK: feedback,
  AGING: aging,
  PRIORITY_PREEMPTIVE: priorityPreemptive,
  PRIORITY_NON_PREEMPTIVE: (processes) => aging(processes, { preemptive: false, agingInterval: 0 })
};

export const getAlgorithm = (name) => {
  const algo = algorithms[name.toUpperCase()];
  if (!algo) {
    throw new Error(`Algorithm '${name}' not found. Available: ${Object.keys(algorithms).join(', ')}`);
  }
  return algo;
};

export const listAlgorithms = () => Object.keys(algorithms);

export default algorithms;