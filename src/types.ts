export interface Process {
  id: number;
  at: number;
  bt: number;
  ft?: number;
  tat?: number;
  wt?: number;
  color: string;
}

export interface GanttSlice {
  id: string | number; // 'Idle' or process id
  start: number;
  end: number;
  color: string;
}

export type Algorithm = 'fcfs' | 'sjf' | 'rr';
