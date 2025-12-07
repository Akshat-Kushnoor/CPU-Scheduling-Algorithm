// src/services/schedulers.js
import rr from "./rr"; // Your RR implementation
import priorityPreemptive from "./priorityPreemptive";
import srtf from "./srtf"; // Your SRT/SRTF implementation
import fcfs from "./fcfs"; // Implemented separately
import sjf from "./sjf"; // Implemented separately

export const schedulerMap = {
  FCFS: fcfs,
  SJF: sjf,
  SRTF: srtf,
  "Priority Preemptive": priorityPreemptive,
  RR: rr,
};
