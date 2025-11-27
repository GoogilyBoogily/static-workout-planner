import { useState, useEffect, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import Papa from 'papaparse'
import './App.css'
import ExerciseDetailModal from './components/ExerciseDetailModal'
import ExerciseList from './components/ExerciseList'
import MuscleDiagram from './components/MuscleDiagram'
import SearchInput from './components/SearchInput'
import TagFilter from './components/TagFilter'
import EquipmentFilter from './components/EquipmentFilter'
import ErrorMessage from './components/ErrorMessage'
import StorageWarning from './components/StorageWarning'
import PlanForm from './components/PlanForm'
import PlanList from './components/PlanList'
import PlanDetail from './components/PlanDetail'
import QuotaForm from './components/QuotaForm'
import ThemeToggle from './components/ThemeToggle'
import CircuitTimer from './components/CircuitTimer'
import { filterExercisesByMuscles } from './utils/muscleFilter'
import { convertToLibraryNames } from './assets/muscle-groups'
import PlansStorage from './utils/localStorage'
import { QuotaTemplateStorage } from './utils/quotaTemplates'
import { buildExercisePool, getAvailableTags, generateWorkoutPlan, generatePlanName } from './utils/randomGenerator'

import type {
  ParsedExercise,
  CSVExerciseRow,
  WorkoutPlan,
  PlanFormData,
  ExercisePool,
  TagQuota,
  QuotaTemplate,
  Theme,
  AppView
} from './types'

function App() {
  const [data, setData] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [exercises, setExercises] = useState<ParsedExercise[]>([])

  // Modal state for exercise details (T006)
  const [selectedExercise, setSelectedExercise] = useState<ParsedExercise | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // T023: Muscle selection state
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [hoveredMuscle, setHoveredMuscle] = useState<string[]>([])

  // Search and filter state (002-exercise-list-filters)
  const [searchText, setSearchText] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])

  // Workout Plans state (T006)
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [currentView, setCurrentView] = useState<AppView>('list')
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null)
  const [showSyncWarning, setShowSyncWarning] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)

  // Random workout generation state (Feature 005)
  const [quotaFormOpen, setQuotaFormOpen] = useState(false)
  const [exercisePool, setExercisePool] = useState<ExercisePool>({})
  const [quotaTemplates, setQuotaTemplates] = useState<QuotaTemplate[]>([])

  // Circuit Timer state (Feature 006)
  const [timerActive, setTimerActive] = useState(false)
  const [timerPlan, setTimerPlan] = useState<WorkoutPlan | null>(null)

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('workout-planner-theme')
    return (savedTheme as Theme) || 'dark' // Default to dark mode
  })

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('workout-planner-theme', theme)
  }, [theme])

  const handleThemeToggle = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  // T007: Load plans from localStorage on mount
  useEffect(() => {
    const loadedPlans = PlansStorage.loadPlans()
    setPlans(loadedPlans)

    // Check if localStorage is available
    if (!PlansStorage.isAvailable()) {
      setStorageError('localStorage is not available. Are you in private browsing mode?')
    }
  }, [])

  // T019: Load exercise pool and quota templates on mount (Feature 005)
  // FIXED H3: Added error handling to prevent app crashes
  useEffect(() => {
    try {
      const pool = buildExercisePool(plans)
      setExercisePool(pool)

      const templates = QuotaTemplateStorage.loadTemplates()
      setQuotaTemplates(templates)

      // Clear any previous errors if successful
      if (storageError && storageError.includes('exercise data')) {
        setStorageError(null)
      }
    } catch (err) {
      console.error('Failed to build exercise pool:', err)
      setStorageError('Failed to load exercise data. Some features may not work.')
      setExercisePool({})
      setQuotaTemplates([])
    }
  }, [plans]) // Rebuild when plans change

  // Auto-load standardized workouts on mount
  useEffect(() => {
    loadSampleData()
  }, [])

  // T008: Storage event listener for cross-tab sync
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
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

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setError(null)

    Papa.parse<CSVExerciseRow>(file, {
      header: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Parse exercises with Muscle Group filter
          const parsedExercises: ParsedExercise[] = results.data
            .filter(row => row['Muscle Group'] && row['Muscle Group'].trim())
            .map(row => ({
              name: row.Exercise ?? '',
              tags: row['Muscle Group']?.split(',').map(tag => tag.trim()).filter(tag => tag) ?? [],
              description: row.Description ?? '',
              equipment: row.Equipment ? row.Equipment.split(',').map(e => e.trim()).filter(e => e) : [],
              optionalEquipment: row['Optional Equipment'] ? row['Optional Equipment'].split(',').map(e => e.trim()).filter(e => e) : [],
              youtubeUrl: row['YouTube URL'] ?? null
            }))

          setExercises(parsedExercises)
          // Keep raw data for table view
          setHeaders(results.meta.fields ?? [])
          setData(results.data.filter(row => row.Exercise) as Record<string, string>[])
          setError(null)
        }
      },
      error: (parseError) => {
        setError(`Error parsing CSV: ${parseError.message}`)
      }
    })
  }

  const loadSampleData = () => {
    fetch(`${import.meta.env.BASE_URL}default-workouts.csv`)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse<CSVExerciseRow>(csvText, {
          header: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              // Parse exercises with Muscle Group filter
              const parsedExercises: ParsedExercise[] = results.data
                .filter(row => row['Muscle Group'] && row['Muscle Group'].trim())
                .map(row => ({
                  name: row.Exercise ?? '',
                  tags: row['Muscle Group']?.split(',').map(tag => tag.trim()).filter(tag => tag) ?? [],
                  description: row.Description ?? '',
                  equipment: row.Equipment ? row.Equipment.split(',').map(e => e.trim()).filter(e => e) : [],
                  optionalEquipment: row['Optional Equipment'] ? row['Optional Equipment'].split(',').map(e => e.trim()).filter(e => e) : [],
                  youtubeUrl: row['YouTube URL'] ?? null
                }))

              setExercises(parsedExercises)
              // Keep raw data for table view
              setHeaders(results.meta.fields ?? [])
              setData(results.data.filter(row => row.Exercise) as Record<string, string>[])
              setError(null)
            }
          },
          error: (parseError: Error) => {
            setError(`Error parsing CSV: ${parseError.message}`)
          }
        })
      })
      .catch(err => {
        setError(`Error loading default data: ${err instanceof Error ? err.message : String(err)}`)
      })
  }

  // Modal handlers (T007, T022)
  const handleExerciseClick = (exercise: ParsedExercise, index: number) => {
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
      const nextExercise = filteredExercises[nextIndex]
      if (nextExercise) {
        setSelectedExercise(nextExercise)
      }
    }
  }

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      const prevIndex = selectedIndex - 1
      setSelectedIndex(prevIndex)
      const prevExercise = filteredExercises[prevIndex]
      if (prevExercise) {
        setSelectedExercise(prevExercise)
      }
    }
  }

  // T024: Muscle toggle handler (used by both MuscleDiagram and TagFilter)
  const handleMuscleToggle = (muscleName: string) => {
    setSelectedMuscles(prev =>
      prev.includes(muscleName)
        ? prev.filter(m => m !== muscleName) // deselect
        : [...prev, muscleName] // select
    )
  }

  // Equipment toggle handler
  const handleEquipmentToggle = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment) // deselect
        : [...prev, equipment] // select
    )
  }

  // Clear all filters (search + muscle selection + equipment)
  const handleClearAllFilters = () => {
    setSearchText('')
    setSelectedMuscles([])
    setSelectedEquipment([])
  }

  // T027: Handle create plan
  const handleCreatePlan = () => {
    setCurrentView('create')
    setSelectedPlan(null)
  }

  // T028-T029: Handle save plan (create or edit)
  const handleSavePlan = (planData: PlanFormData) => {
    try {
      if (selectedPlan) {
        // Editing existing plan
        const updatedPlan: WorkoutPlan = {
          ...selectedPlan,
          name: planData.name,
          exercises: planData.exercises,
          isCircuit: planData.isCircuit,
          updatedAt: Date.now()
        }

        const updatedPlans = plans.map(p =>
          p.id === selectedPlan.id ? updatedPlan : p
        )

        PlansStorage.savePlans(updatedPlans)
        setPlans(updatedPlans)
      } else {
        // Creating new plan
        const newPlan: WorkoutPlan = {
          id: crypto.randomUUID(),
          name: planData.name,
          exercises: planData.exercises,
          isCircuit: planData.isCircuit || false,
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
    } catch (err) {
      // T068: Enhanced error handling for localStorage quota exceeded
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        setStorageError('Storage limit reached. Delete old plans or templates to free space.')
      } else {
        setStorageError(err instanceof Error ? err.message : String(err))
      }
    }
  }

  // Handle cancel plan form
  const handleCancelPlan = () => {
    setCurrentView('list')
    setSelectedPlan(null)
  }

  // T044: Handle edit plan
  const handleEditPlan = (plan: WorkoutPlan) => {
    setSelectedPlan(plan)
    setCurrentView('edit')
  }

  // T056-T060: Handle delete plan
  const handleDeletePlan = (plan: WorkoutPlan) => {
    const confirmed = window.confirm(`Delete "${plan.name}"?`)

    if (confirmed) {
      const updatedPlans = plans.filter(p => p.id !== plan.id)
      PlansStorage.savePlans(updatedPlans)
      setPlans(updatedPlans)
    }
  }

  // T043: Handle view plan details
  const handleViewPlan = (plan: WorkoutPlan) => {
    setSelectedPlan(plan)
    setCurrentView('detail')
  }

  // Handle close plan detail
  const handleClosePlanDetail = () => {
    setCurrentView('list')
    setSelectedPlan(null)
  }

  // T020: Handle "Generate Random Workout" button click (Feature 005)
  const handleGenerateRandom = () => {
    setQuotaFormOpen(true)
  }

  // T021: Handle quota generation (Feature 005)
  const handleQuotaGenerate = (quotas: TagQuota[]) => {
    const { exercises: generatedExercises, errors } = generateWorkoutPlan(quotas, exercisePool)

    if (errors.length > 0) {
      // Show errors to user
      alert('Generation errors:\n' + errors.join('\n'))
    }

    if (generatedExercises.length === 0) {
      alert('No exercises could be generated. Please adjust your quotas.')
      return
    }

    // Create new plan with generated exercises
    const newPlan: WorkoutPlan = {
      id: crypto.randomUUID(),
      name: generatePlanName(),
      exercises: generatedExercises,
      isCircuit: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isGenerated: true,
      generationTimestamp: Date.now(),
      pinStatus: {}
    }

    // Set as selected plan and open in edit mode
    setSelectedPlan(newPlan)
    setCurrentView('edit')
    setQuotaFormOpen(false)
  }

  // Handle quota form cancel
  const handleQuotaFormCancel = () => {
    setQuotaFormOpen(false)
  }

  // T005-T007: Circuit Timer handlers (Feature 006)
  const handleStartTimer = (plan: WorkoutPlan) => {
    setTimerPlan(plan)
    setTimerActive(true)
  }

  const handleCloseTimer = () => {
    setTimerActive(false)
    setTimerPlan(null)
  }

  // Handle timer plan update (e.g., when exercises are reordered via drag-and-drop)
  const handleUpdateTimerPlan = (updatedPlan: WorkoutPlan) => {
    try {
      // Update local timer plan state
      setTimerPlan(updatedPlan)

      // Update the plan in the plans array
      const updatedPlans = plans.map(p =>
        p.id === updatedPlan.id ? updatedPlan : p
      )

      // Persist to localStorage
      PlansStorage.savePlans(updatedPlans)
      setPlans(updatedPlans)
    } catch (err) {
      console.error('Failed to update timer plan:', err)
      setStorageError('Failed to save exercise changes.')
    }
  }

  // T068: Handle save quota template with error handling (Feature 005)
  const handleSaveQuotaTemplate = (name: string, quotas: TagQuota[]) => {
    const result = QuotaTemplateStorage.addTemplate(name, quotas)

    if (result.success) {
      // Reload templates
      const templates = QuotaTemplateStorage.loadTemplates()
      setQuotaTemplates(templates)
      alert('Template saved successfully!')
      setStorageError(null) // Clear any previous errors
    } else {
      // T068: Show storage error banner for quota exceeded
      if (result.error === 'quota') {
        setStorageError(result.message ?? 'Storage limit reached. Delete old templates or plans to free space.')
      } else {
        setStorageError(result.message ?? 'Failed to save template')
      }
    }
  }

  // T062: Handle delete quota template (Feature 005)
  const handleDeleteQuotaTemplate = (templateId: string) => {
    const result = QuotaTemplateStorage.deleteTemplate(templateId)

    if (result.success) {
      // Reload templates
      const templates = QuotaTemplateStorage.loadTemplates()
      setQuotaTemplates(templates)
    } else {
      alert(result.message ?? 'Failed to delete template')
    }
  }

  // Extract unique tags/muscles from all exercises for TagFilter
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    exercises.forEach(exercise => {
      if (exercise.tags && exercise.tags.length > 0) {
        exercise.tags.forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [exercises])

  // Convert available tags to library muscle slugs for MuscleDiagram
  const availableMuscles = useMemo(() => {
    return convertToLibraryNames(availableTags)
  }, [availableTags])

  // Extract unique equipment from all exercises for EquipmentFilter (both required and optional)
  const availableEquipment = useMemo(() => {
    const equipmentSet = new Set<string>()
    exercises.forEach(exercise => {
      if (exercise.equipment && exercise.equipment.length > 0) {
        exercise.equipment.forEach(item => equipmentSet.add(item))
      }
      if (exercise.optionalEquipment && exercise.optionalEquipment.length > 0) {
        exercise.optionalEquipment.forEach(item => equipmentSet.add(item))
      }
    })
    return Array.from(equipmentSet).sort()
  }, [exercises])

  // Combined filtering: search + muscle selection + equipment (AND relationship)
  const filteredExercises = useMemo(() => {
    let filtered = exercises

    // Apply search filter (if searchText is not empty)
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchLower)
      )
    }

    // Apply muscle filter (if muscles are selected)
    if (selectedMuscles.length > 0) {
      filtered = filterExercisesByMuscles(filtered, selectedMuscles)
    }

    // Apply equipment filter (if equipment is selected)
    if (selectedEquipment.length > 0) {
      filtered = filtered.filter(exercise => {
        // Exercise must have at least one of the selected equipment (in either required or optional)
        const hasRequiredEquipment = exercise.equipment && exercise.equipment.some(item =>
          selectedEquipment.includes(item)
        )
        const hasOptionalEquipment = exercise.optionalEquipment && exercise.optionalEquipment.some(item =>
          selectedEquipment.includes(item)
        )
        return hasRequiredEquipment || hasOptionalEquipment
      })
    }

    return filtered
  }, [exercises, searchText, selectedMuscles, selectedEquipment])

  // T042: Sort plans by updatedAt descending (newest first)
  const sortedPlans = [...plans].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="App">
      <div className="app-header">
        <h1>Workout Planner</h1>
        <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
      </div>

      <div className="csv-loader">
        <div className="file-input">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            id="csv-upload"
          />
          <label htmlFor="csv-upload">Upload Custom Workouts</label>
        </div>

        <button onClick={loadSampleData} className="reload-button">
          Reload Default Workouts
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

      {/* Plans Section: Full width at top */}
      <div className="plans-section">
        {/* T032-T043: Plan List */}
        {/* T007: Circuit Timer View (Feature 006) */}
        {timerActive && (
          <CircuitTimer
            onClose={handleCloseTimer}
            plan={timerPlan}
            onUpdatePlan={handleUpdateTimerPlan}
          />
        )}

        {currentView === 'list' && !timerActive && (
          <PlanList
            plans={sortedPlans}
            onCreate={handleCreatePlan}
            onEdit={handleEditPlan}
            onDelete={handleDeletePlan}
            onView={handleViewPlan}
            onGenerateRandom={handleGenerateRandom}
            exercisePoolEmpty={Object.keys(exercisePool).length === 0}
            onStartTimer={handleStartTimer}
          />
        )}

        {currentView === 'create' && (
          <PlanForm
            plan={null}
            onSave={handleSavePlan}
            onCancel={handleCancelPlan}
            exercisePool={exercisePool}
            exerciseLibrary={exercises}
            isGenerated={false}
          />
        )}

        {currentView === 'edit' && selectedPlan && (
          <PlanForm
            plan={selectedPlan}
            onSave={handleSavePlan}
            onCancel={handleCancelPlan}
            exercisePool={exercisePool}
            exerciseLibrary={exercises}
            isGenerated={selectedPlan.isGenerated || false}
          />
        )}

        {/* T072: Plan Detail Modal */}
        {currentView === 'detail' && selectedPlan && (
          <PlanDetail
            plan={selectedPlan}
            onClose={handleClosePlanDetail}
          />
        )}
      </div>

      {/* Main Content: Two-column layout */}
      <div className="main-content">
        {/* Left Column: Muscle Diagram */}
        <div className="muscle-column">
          <MuscleDiagram
            selectedMuscles={selectedMuscles}
            onMuscleToggle={handleMuscleToggle}
            hoveredMuscle={hoveredMuscle}
            onMuscleHover={setHoveredMuscle}
            availableMuscles={availableMuscles}
          />
        </div>

        {/* Right Column: Search, Filters, and Exercise List */}
        <div className="exercise-column">
          {/* Search and Filter Section (002-exercise-list-filters) */}
          {exercises.length > 0 && (
            <div className="filter-section">
              {/* Search Input */}
              <SearchInput
                value={searchText}
                onChange={setSearchText}
                placeholder="Search exercises by name..."
              />

              {/* Tag Filter Pills (synced with MuscleDiagram) */}
              <TagFilter
                availableTags={availableTags}
                selectedTags={selectedMuscles}
                onTagToggle={handleMuscleToggle}
              />

              {/* Equipment Filter Pills */}
              <EquipmentFilter
                availableEquipment={availableEquipment}
                selectedEquipment={selectedEquipment}
                onEquipmentToggle={handleEquipmentToggle}
              />

              {/* Filter indicator with Clear All button */}
              {(searchText.trim() || selectedMuscles.length > 0 || selectedEquipment.length > 0) && (
                <div className="filter-indicator">
                  {searchText.trim() && (
                    <span className="filter-info">
                      <strong>Search:</strong> "{searchText}"
                    </span>
                  )}
                  {selectedMuscles.length > 0 && (
                    <span className="filter-info">
                      <strong>Muscles:</strong> {selectedMuscles.join(', ')}
                    </span>
                  )}
                  {selectedEquipment.length > 0 && (
                    <span className="filter-info">
                      <strong>Equipment:</strong> {selectedEquipment.join(', ')}
                    </span>
                  )}
                  <button
                    onClick={handleClearAllFilters}
                    className="clear-all-filters"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Exercise List - Clickable (T031: use filteredExercises) */}
          {filteredExercises.length > 0 && (
            <ExerciseList
              exercises={filteredExercises}
              onExerciseClick={handleExerciseClick}
              onExerciseHover={setHoveredMuscle}
              hoveredMuscle={hoveredMuscle}
            />
          )}

          {/* No results message */}
          {exercises.length > 0 && filteredExercises.length === 0 && (
            <div className="info">
              No exercises match your current filters. Try adjusting your search or muscle selection.
            </div>
          )}
        </div>
      </div>

      {/* Exercise Detail Modal (T010, T023, T024) */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        exerciseIndex={selectedIndex}
        totalExercises={filteredExercises.length}
        onClose={handleCloseModal}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      {/* T022: Quota Form Modal (Feature 005) */}
      {quotaFormOpen && (
        <QuotaForm
          availableTags={getAvailableTags(exercisePool)}
          exercisePool={exercisePool}
          quotaTemplates={quotaTemplates}
          onGenerate={handleQuotaGenerate}
          onCancel={handleQuotaFormCancel}
          onSaveTemplate={handleSaveQuotaTemplate}
          onDeleteTemplate={handleDeleteQuotaTemplate}
        />
      )}

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
          Loading standardized workouts...
        </div>
      ) : null}
    </div>
  )
}

export default App
