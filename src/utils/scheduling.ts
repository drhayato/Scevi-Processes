import { Process, GanttSlice } from '../types';

export const COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
  '#f43f5e', // rose-500
  '#14b8a6', // teal-500
];

export function solveFCFS(procs: Process[]): GanttSlice[] {
  const sorted = [...procs].sort((a, b) => a.at - b.at);
  let time = 0;
  const schedule: GanttSlice[] = [];

  sorted.forEach((p) => {
    if (time < p.at) {
      schedule.push({ id: 'Idle', start: time, end: p.at, color: '#e2e8f0' });
      time = p.at;
    }
    schedule.push({ id: p.id, start: time, end: time + p.bt, color: p.color });
    time += p.bt;
  });
  return schedule;
}

export function solveSJF(procs: Process[]): GanttSlice[] {
  let time = 0;
  const schedule: GanttSlice[] = [];
  let remaining = [...procs].sort((a, b) => a.at - b.at);

  while (remaining.length > 0) {
    const available = remaining.filter((p) => p.at <= time);
    if (available.length > 0) {
      available.sort((a, b) => a.bt - b.bt);
      const p = available[0];
      schedule.push({ id: p.id, start: time, end: time + p.bt, color: p.color });
      time += p.bt;
      remaining = remaining.filter((item) => item.id !== p.id);
    } else {
      const nextArrival = remaining[0].at;
      schedule.push({ id: 'Idle', start: time, end: nextArrival, color: '#e2e8f0' });
      time = nextArrival;
    }
  }
  return schedule;
}

export function solveRR(procs: Process[], q: number): GanttSlice[] {
  let time = 0;
  const schedule: GanttSlice[] = [];
  const queue: (Process & { rbt: number })[] = [];
  const remainingBT = procs.map((p) => ({ ...p, rbt: p.bt }));
  let sorted = [...remainingBT].sort((a, b) => a.at - b.at);

  while (sorted.length > 0 || queue.length > 0) {
    while (sorted.length > 0 && sorted[0].at <= time) {
      queue.push(sorted.shift()!);
    }

    if (queue.length === 0) {
      if (sorted.length > 0) {
        schedule.push({ id: 'Idle', start: time, end: sorted[0].at, color: '#e2e8f0' });
        time = sorted[0].at;
        continue;
      }
      break;
    }

    const p = queue.shift()!;
    const exec = Math.min(p.rbt, q);
    schedule.push({ id: p.id, start: time, end: time + exec, color: p.color });
    time += exec;
    p.rbt -= exec;

    while (sorted.length > 0 && sorted[0].at <= time) {
      queue.push(sorted.shift()!);
    }

    if (p.rbt > 0) {
      queue.push(p);
    }
  }
  return schedule;
}

export function calculateMetrics(procs: Process[], schedule: GanttSlice[]) {
  return procs.map((p) => {
    const finishedSlices = schedule.filter((s) => s.id === p.id);
    const ft = finishedSlices[finishedSlices.length - 1].end;
    const tat = ft - p.at;
    const wt = tat - p.bt;
    return { ...p, ft, tat, wt };
  });
}
