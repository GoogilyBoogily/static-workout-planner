# Workout Planner

A basic React frontend application that loads and displays data from CSV files.

## Features

- Load CSV files via file upload
- Load sample workout data
- Display data in a formatted table
- Responsive design with light/dark mode support

## Getting Started

This project uses Bun as the package manager and runtime.

### Install Dependencies

```bash
bun install
```

### Run Development Server

```bash
bun dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## Usage

1. Click "Load Sample Data" to load the included sample workout CSV
2. Or upload your own CSV file using the file input
3. The data will be displayed in a table format

## CSV Format

The app expects CSV files with headers in the first row. Example:

```csv
Exercise,Sets,Reps,Weight (lbs),Rest (sec),Day
Bench Press,4,8-10,185,90,Monday
Squats,4,8-10,225,120,Monday
```

## Technologies Used

- React 18
- Vite
- PapaParse (CSV parsing)
- Bun (package manager and runtime)
