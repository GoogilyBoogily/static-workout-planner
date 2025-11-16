import { useState } from 'react'
import Papa from 'papaparse'
import './App.css'
import ExerciseDetailModal from './components/ExerciseDetailModal'
import ExerciseList from './components/ExerciseList'
import MuscleDiagram from './components/MuscleDiagram'
import { filterExercisesByMuscles } from './utils/muscleFilter'

function App() {
  const [data, setData] = useState([])
  const [headers, setHeaders] = useState([])
  const [error, setError] = useState(null)
  const [exercises, setExercises] = useState([])

  // Modal state for exercise details (T006)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)

  // T023: Muscle selection state
  const [selectedMuscles, setSelectedMuscles] = useState([])
  const [hoveredMuscle, setHoveredMuscle] = useState(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setError(null)

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Parse exercises with Muscle Group filter
          const parsedExercises = results.data
            .filter(row => row['Muscle Group'] && row['Muscle Group'].trim())
            .map(row => ({
              name: row.Exercise,
              tags: row['Muscle Group'].split(',').map(tag => tag.trim()).filter(tag => tag),
              sets: row.Sets,
              reps: row.Reps,
              weight: row['Weight (lbs)'],
              rest: row['Rest (sec)'],
              day: row.Day,
              youtubeUrl: row['YouTube URL'] || null
            }))

          setExercises(parsedExercises)
          // Keep raw data for table view
          setHeaders(results.meta.fields || [])
          setData(results.data.filter(row => row.Exercise))
          setError(null)
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`)
      }
    })
  }

  const loadSampleData = () => {
    fetch('/sample-workouts.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              // Parse exercises with Muscle Group filter
              const parsedExercises = results.data
                .filter(row => row['Muscle Group'] && row['Muscle Group'].trim())
                .map(row => ({
                  name: row.Exercise,
                  tags: row['Muscle Group'].split(',').map(tag => tag.trim()).filter(tag => tag),
                  sets: row.Sets,
                  reps: row.Reps,
                  weight: row['Weight (lbs)'],
                  rest: row['Rest (sec)'],
                  day: row.Day,
                  youtubeUrl: row['YouTube URL'] || null
                }))

              setExercises(parsedExercises)
              // Keep raw data for table view
              setHeaders(results.meta.fields || [])
              setData(results.data.filter(row => row.Exercise))
              setError(null)
            }
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error.message}`)
          }
        })
      })
      .catch(err => {
        setError(`Error loading sample data: ${err.message}`)
      })
  }

  // Modal handlers (T007, T022)
  const handleExerciseClick = (exercise, index) => {
    setSelectedExercise(exercise)
    setSelectedIndex(index)
  }

  const handleCloseModal = () => {
    setSelectedExercise(null)
    setSelectedIndex(null)
  }

  // Navigation handlers (T022)
  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredExercises.length - 1) {
      const nextIndex = selectedIndex + 1
      setSelectedIndex(nextIndex)
      setSelectedExercise(filteredExercises[nextIndex])
    }
  }

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      const prevIndex = selectedIndex - 1
      setSelectedIndex(prevIndex)
      setSelectedExercise(filteredExercises[prevIndex])
    }
  }

  // T024: Muscle toggle handler
  const handleMuscleToggle = (muscleName) => {
    setSelectedMuscles(prev =>
      prev.includes(muscleName)
        ? prev.filter(m => m !== muscleName) // deselect
        : [...prev, muscleName] // select
    )
  }

  // T029-T030: Apply muscle filter to exercises
  const filteredExercises = filterExercisesByMuscles(exercises, selectedMuscles)

  return (
    <div className="App">
      <h1>Workout Planner</h1>

      <div className="csv-loader">
        <div className="file-input">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            id="csv-upload"
          />
          <label htmlFor="csv-upload"></label>
        </div>

        <button onClick={loadSampleData}>
          Load Sample Data
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* T015: Muscle Diagram Component */}
      <MuscleDiagram
        selectedMuscles={selectedMuscles}
        onMuscleToggle={handleMuscleToggle}
        hoveredMuscle={hoveredMuscle}
        onMuscleHover={setHoveredMuscle}
      />

      {/* T032: Filter indicator */}
      {selectedMuscles.length > 0 && (
        <div className="filter-indicator">
          <strong>Filtered by:</strong> {selectedMuscles.join(', ')}
          <button
            onClick={() => setSelectedMuscles([])}
            className="clear-filters"
            style={{ marginLeft: '10px', padding: '4px 8px' }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Exercise List - Clickable (T031: use filteredExercises) */}
      {filteredExercises.length > 0 && (
        <ExerciseList
          exercises={filteredExercises}
          onExerciseClick={handleExerciseClick}
        />
      )}

      {/* No results message */}
      {exercises.length > 0 && filteredExercises.length === 0 && (
        <div className="info">
          No exercises found for selected muscle groups. Try selecting different muscles.
        </div>
      )}

      {/* Exercise Detail Modal (T010, T023, T024) */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        exerciseIndex={selectedIndex}
        totalExercises={filteredExercises.length}
        onClose={handleCloseModal}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      {/* Original Data Table View */}
      {data.length > 0 ? (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : exercises.length === 0 ? (
        <div className="info">
          Upload a CSV file or load sample data to get started
        </div>
      ) : null}
    </div>
  )
}

export default App
