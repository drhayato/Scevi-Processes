import { useState, useMemo } from "react";
import { 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Activity, 
  BarChart3, 
  Layout,
  Info
} from "lucide-react";
import { Process, GanttSlice, Algorithm } from "./types";
import { 
  solveFCFS, 
  solveSJF, 
  solveRR, 
  calculateMetrics, 
  COLORS 
} from "./utils/scheduling";

export default function App() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("fcfs");
  const [quantum, setQuantum] = useState<number>(2);
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, at: 0, bt: 5, color: COLORS[0] },
    { id: 2, at: 1, bt: 3, color: COLORS[1] },
    { id: 3, at: 2, bt: 1, color: COLORS[2] },
  ]);
  const [schedule, setSchedule] = useState<GanttSlice[] | null>(null);
  const [results, setResults] = useState<Process[] | null>(null);

  const addProcess = () => {
    if (processes.length >= 10) return;
    const newId = processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1;
    setProcesses([
      ...processes,
      { 
        id: newId, 
        at: 0, 
        bt: Math.floor(Math.random() * 5) + 1, 
        color: COLORS[processes.length % COLORS.length] 
      },
    ]);
    resetResults();
  };

  const removeProcess = (id: number) => {
    setProcesses(processes.filter(p => p.id !== id));
    resetResults();
  };

  const updateProcess = (id: number, field: "at" | "bt", value: number) => {
    setProcesses(processes.map(p => p.id === id ? { ...p, [field]: value } : p));
    resetResults();
  };

  const resetResults = () => {
    setSchedule(null);
    setResults(null);
  };

  const runSimulation = () => {
    if (processes.length === 0) return;
    let resultSchedule: GanttSlice[] = [];
    if (algorithm === "fcfs") resultSchedule = solveFCFS(processes);
    else if (algorithm === "sjf") resultSchedule = solveSJF(processes);
    else if (algorithm === "rr") resultSchedule = solveRR(processes, quantum);

    const calculatedProcesses = calculateMetrics(processes, resultSchedule);
    setSchedule(resultSchedule);
    setResults(calculatedProcesses);
  };

  const avgTat = useMemo(() => {
    if (!results || results.length === 0) return 0;
    return results.reduce((acc, p) => acc + (p.tat || 0), 0) / results.length;
  }, [results]);

  const avgWt = useMemo(() => {
    if (!results || results.length === 0) return 0;
    return results.reduce((acc, p) => acc + (p.wt || 0), 0) / results.length;
  }, [results]);

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans selection:bg-blue-100 bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Activity className="text-blue-600" size={36} />
              CPU Scheduler
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Visualize process execution algorithms</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setProcesses([
                  { id: 1, at: 0, bt: 5, color: COLORS[0] },
                  { id: 2, at: 1, bt: 3, color: COLORS[1] },
                  { id: 3, at: 2, bt: 1, color: COLORS[2] },
                ]);
                resetResults();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm font-medium"
            >
              <RotateCcw size={18} />
              Reset All
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Configuration */}
          <section className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-lg border-b border-slate-50 pb-4">
                <Layout size={20} className="text-blue-500" />
                Algorithm Control
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Algorithm</label>
                  <select
                    value={algorithm}
                    onChange={(e) => {
                      setAlgorithm(e.target.value as Algorithm);
                      resetResults();
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all"
                  >
                    <option value="fcfs">First Come First Serve (FCFS)</option>
                    <option value="sjf">Shortest Job First (Non-Preemptive)</option>
                    <option value="rr">Round Robin (RR)</option>
                  </select>
                </div>

                {algorithm === "rr" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Time Quantum</label>
                    <input
                      type="number"
                      min="1"
                      value={quantum}
                      onChange={(e) => {
                        setQuantum(Math.max(1, parseInt(e.target.value) || 1));
                        resetResults();
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all"
                    />
                  </div>
                )}

                <button
                  onClick={runSimulation}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                >
                  <Play size={20} fill="currentColor" />
                  Run Simulation
                </button>
              </div>
            </div>

            {/* Metrics Preview */}
            {results && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-md">
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Avg Turnaround</p>
                  <div className="text-3xl font-black">{avgTat.toFixed(2)}</div>
                </div>
                <div className="bg-indigo-600 p-5 rounded-2xl text-white shadow-md">
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Avg Waiting</p>
                  <div className="text-3xl font-black">{avgWt.toFixed(2)}</div>
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Process List */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                  <BarChart3 size={20} className="text-blue-500" />
                  Process Configuration
                </div>
                <button
                  onClick={addProcess}
                  disabled={processes.length >= 10}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition-colors"
                >
                  <Plus size={18} />
                  Add Process
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="col-span-2">ID</div>
                  <div className="col-span-4">Arrival Time</div>
                  <div className="col-span-4">Burst Time</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>
                
                <div className="space-y-2">
                  {processes.map((p) => (
                    <div
                      key={p.id}
                      className="grid grid-cols-12 gap-4 items-center p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-transparent hover:border-slate-200 transition-all group animate-in slide-in-from-left-2 duration-300"
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm" style={{ backgroundColor: p.color }}>
                          P{p.id}
                        </div>
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          min="0"
                          value={p.at}
                          onChange={(e) => updateProcess(p.id, "at", Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          min="1"
                          value={p.bt}
                          onChange={(e) => updateProcess(p.id, "bt", Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={() => removeProcess(p.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {processes.length === 0 && (
                  <div className="py-12 text-center space-y-3">
                    <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <Plus size={24} />
                    </div>
                    <p className="text-slate-400 text-sm">Add some processes to start visualization</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Results Visualization */}
        {schedule && results && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Gantt Chart */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-800">Gantt Chart</h2>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                  <Info size={14} />
                  Execution Timeline
                </div>
              </div>
              
              <div className="flex h-32 w-full border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                {schedule.map((slice, i) => {
                  const totalTime = schedule[schedule.length - 1].end;
                  const width = totalTime > 0 ? ((slice.end - slice.start) / totalTime) * 100 : 0;
                  return (
                    <div
                      key={`${slice.id}-${i}`}
                      className="relative h-full flex flex-col justify-end group grow-0 shrink-0 border-r border-white/20 transition-all duration-500"
                      style={{ width: `${width}%` }}
                    >
                      <div className="absolute top-2 left-1 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {slice.start}
                      </div>
                      <div 
                        className="h-16 flex items-center justify-center text-white text-sm font-black shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)] transition-all cursor-default overflow-hidden group-hover:brightness-110" 
                        style={{ backgroundColor: slice.color }}
                      >
                        <span className="truncate px-1">
                          {slice.id === "Idle" ? "" : "P" + slice.id}
                        </span>
                      </div>
                      {i === schedule.length - 1 && (
                        <div className="absolute top-2 right-1 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                          {slice.end}
                        </div>
                      )}
                      {/* Hover detail tooltip replacement */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 bg-slate-800 text-white text-[10px] rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-xl">
                        <div className="font-bold border-b border-white/10 mb-1 pb-1">
                          {slice.id === "Idle" ? "CPU Idle" : `Process P${slice.id}`}
                        </div>
                        <div className="opacity-80">
                          {slice.start} → {slice.end} (Duration: {slice.end - slice.start}s)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-xl font-black text-slate-800">Detailed Report</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Process</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrival</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Burst</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Finish</th>
                      <th className="p-0"></th>
                      <th className="px-6 py-4 text-[10px] font-black text-blue-500 uppercase tracking-widest">Turnaround</th>
                      <th className="px-6 py-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest">Waiting</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...results].sort((a,b) => a.id - b.id).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                            <span className="font-bold text-slate-700">P{p.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{p.at}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{p.bt}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{p.ft}</td>
                        <td className="p-0 border-l border-slate-100"></td>
                        <td className="px-6 py-4 text-blue-600 font-black">{p.tat}</td>
                        <td className="px-6 py-4 text-indigo-600 font-black">{p.wt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <footer className="pt-12 pb-6 text-center">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            OS Simulation Tool • Professional Edition
          </p>
        </footer>
      </div>
    </div>
  );
}
