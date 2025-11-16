import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import './App.css'
import ExerciseDetailModal from './components/ExerciseDetailModal'
import ExerciseList from './components/ExerciseList'
import MuscleDiagram from './components/MuscleDiagram'
import ErrorMessage from './components/ErrorMessage'
import StorageWarning from './components/StorageWarning'
import PlanForm from './components/PlanForm'
import PlanList from './components/PlanList'
import PlanDetail from './components/PlanDetail'
import { filterExercisesByMuscles } from './utils/muscleFilter'
import PlansStorage from './utils/localStorage'

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

  // Workout Plans state (T006)
  const [plans, setPlans] = useState([])
  const [currentView, setCurrentView] = useState('list')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showSyncWarning, setShowSyncWarning] = useState(false)
  const [storageError, setStorageError] = useState(null)

  // T007: Load plans from localStorage on mount
  useEffect(() => {
    const loadedPlans = PlansStorage.loadPlans()
    setPlans(loadedPlans)

    // Check if localStorage is available
    if (!PlansStorage.isAvailable()) {
      setStorageError('localStorage is not available. Are you in private browsing mode?')
    }
  }, [])

  // T008: Storage event listener for cross-tab sync
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === PlansStorage.KEY && event.newValue !== null) {
        // Another tab modified the plans
        const updatedPlans = PlansStorage.loadPlans()
        setPlans(updatedPlans)
        setShowSyncWarning(true)

        // Auto-hide warning after 5 seconds
        setTimeout(() => setShowSyncWarning(false), 5000)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

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

  // T027: Handle create plan
  const handleCreatePlan = () => {
    setCurrentView('create')
    setSelectedPlan(null)
  }

  // T028-T029: Handle save plan (create or edit)
  const handleSavePlan = (planData) => {
    try {
      if (selectedPlan) {
        // Editing existing plan
        const updatedPlan = {
          ...selectedPlan,
          name: planData.name,
          exercises: planData.exercises,
          updatedAt: Date.now()
        }

        const updatedPlans = plans.map(p =>
          p.id === selectedPlan.id ? updatedPlan : p
        )

        PlansStorage.savePlans(updatedPlans)
        setPlans(updatedPlans)
      } else {
        // Creating new plan
        const newPlan = {
          id: crypto.randomUUID(),
          name: planData.name,
          exercises: planData.exercises,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }

        const updatedPlans = [...plans, newPlan]
        PlansStorage.savePlans(updatedPlans)
        setPlans(updatedPlans)
      }

      setCurrentView('list')
      setSelectedPlan(null)
      setStorageError(null)
    } catch (error) {
      setStorageError(error.message)
    }
  }

  // Handle cancel plan form
  const handleCancelPlan = () => {
    setCurrentView('list')
    setSelectedPlan(null)
  }

  // T044: Handle edit plan
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan)
    setCurrentView('edit')
  }

  // T056-T060: Handle delete plan
  const handleDeletePlan = (plan) => {
    const confirmed = window.confirm(`Delete "${plan.name}"?`)

    if (confirmed) {
      const updatedPlans = plans.filter(p => p.id !== plan.id)
      PlansStorage.savePlans(updatedPlans)
      setPlans(updatedPlans)
    }
  }

  // T043: Handle view plan details
  const handleViewPlan = (plan) => {
    setSelectedPlan(plan)
    setCurrentView('detail')
  }

  // Handle close plan detail
  const handleClosePlanDetail = () => {
    setCurrentView('list')
    setSelectedPlan(null)
  }

  // T029-T030: Apply muscle filter to exercises
  const filteredExercises = filterExercisesByMuscles(exercises, selectedMuscles)

  // T042: Sort plans by updatedAt descending (newest first)
  const sortedPlans = [...plans].sort((a, b) => b.updatedAt - a.updatedAt)

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

      {/* T009-T012: Error and warning banners */}
      <ErrorMessage
        message={storageError}
        onDismiss={() => setStorageError(null)}
      />
      <StorageWarning
        show={showSyncWarning}
        message="Your workout plans were updated in another tab. The list has been refreshed."
        onDismiss={() => setShowSyncWarning(false)}
      />

      {/* T032-T043: Plan List */}
      {currentView === 'list' && (
        <PlanList
          plans={sortedPlans}
          onCreate={handleCreatePlan}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
          onView={handleViewPlan}
        />
      )}

      {currentView === 'create' && (
        <PlanForm
          plan={null}
          onSave={handleSavePlan}
          onCancel={handleCancelPlan}
        />
      )}

      {currentView === 'edit' && selectedPlan && (
        <PlanForm
          plan={selectedPlan}
          onSave={handleSavePlan}
          onCancel={handleCancelPlan}
        />
      )}

      {/* T072: Plan Detail Modal */}
      {currentView === 'detail' && selectedPlan && (
        <PlanDetail
          plan={selectedPlan}
          onClose={handleClosePlanDetail}
        />
      )}

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
