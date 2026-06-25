# Scevi Processes

Scevi Processes is a CPU Scheduling Visualizer built for OS lab submissions. It provides a modern web-based interface with a Windows desktop wrapper so the project can be used either as a browser app or as an installable desktop application.

## Features

- FCFS (Non-preemptive)
- SJF (Non-preemptive)
- Round Robin scheduling
- Dynamic process input generation
- Arrival Time and Burst Time entry
- Optional Time Quantum input for Round Robin
- Average Waiting Time and Average Turnaround Time
- Execution table with per-process metrics
- Animated Gantt chart with unique process colors
- CPU idle-time handling
- Reset and validation support
- Windows `.exe` build with Electron

## Project Structure

- `index.html` - complete Tailwind CSS UI and scheduling logic
- `main.js` - Electron desktop launcher
- `package.json` - build and packaging configuration
- `dist/` - generated Windows installer artifacts

## Run Locally (for developers)

### Desktop app

```bash
npm install
npm start
```

### Build Windows installer

```bash
npm run build
```

This generates the installer in `dist/`.

## Algorithms Included

### FCFS

Processes are executed in order of arrival.

### SJF

The shortest available burst time is selected next.

### Round Robin

Processes are executed in time slices using the provided time quantum.

## Intended Use

This project is designed to be professional, interactive, and suitable for a Personal Academic Purpose.
