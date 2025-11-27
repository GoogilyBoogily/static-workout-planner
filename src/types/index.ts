/**
 * Core Domain Types for Workout Planner
 *
 * This file contains all shared TypeScript interfaces and types used throughout
 * the application. Import from '@/types' or '../types' as needed.
 */

// ============================================
// Exercise Types
// ============================================

/**
 * Exercise from CSV library (parsed from default-workouts.csv)
 * This represents the raw exercise data loaded from the CSV file.
 */
export interface ParsedExercise {
  name: string
  tags: string[]
  description: string
  equipment: string[]
  optionalEquipment: string[]
  youtubeUrl: string | null
}

/**
 * Raw CSV row before parsing
 * Column names match the CSV headers
 */
export interface CSVExerciseRow {
  Exercise: string
  'Muscle Group': string
  Description?: string
  Equipment?: string
  'Optional Equipment'?: string
  'YouTube URL'?: string
  [key: string]: string | undefined
}

/**
 * Exercise within a workout plan (with workout parameters)
 * This extends parsed exercise data with sets, reps, weight, etc.
 */
export interface PlanExercise {
  id: string
  name: string
  tag: string
  tags?: string[]
  description?: string
  equipment?: string[]
  optionalEquipment?: string[]
  youtubeUrl?: string | null
  sets: number
  reps: string
  weight?: string
  rest?: string
  roundGroup?: number
  day?: string
}

// ============================================
// Workout Plan Types
// ============================================

/** Map of exercise ID to pinned status */
export type PinStatus = Record<string, boolean>

/**
 * Complete workout plan stored in localStorage
 */
export interface WorkoutPlan {
  id: string
  name: string
  exercises: PlanExercise[]
  isCircuit: boolean
  createdAt: number
  updatedAt: number
  /** Custom sort order for drag-drop reordering (lower = first) */
  sortOrder: number
  /** Feature 005: true if randomly generated */
  isGenerated?: boolean
  /** Feature 005: timestamp of last generation */
  generationTimestamp?: number | null
  /** Feature 005: pinned exercise IDs */
  pinStatus?: PinStatus
}

/**
 * Data submitted when saving a plan from PlanForm
 */
export interface PlanFormData {
  name: string
  exercises: PlanExercise[]
  isCircuit: boolean
  pinStatus?: PinStatus
}

// ============================================
// Random Generation Types
// ============================================

/**
 * Tag quota for random workout generation
 */
export interface TagQuota {
  tag: string
  count: number
}

/**
 * Exercise pool grouped by muscle tag
 * Used for random workout generation
 */
export type ExercisePool = Record<string, PlanExercise[]>

/**
 * Quota template saved to localStorage
 */
export interface QuotaTemplate {
  id: string
  name: string
  quotas: TagQuota[]
  createdAt: number
}

/**
 * Result from generateWorkoutPlan
 */
export interface GenerationResult {
  exercises: PlanExercise[]
  errors: string[]
}

// ============================================
// Validation Types
// ============================================

/** Field-specific validation errors */
export type ValidationErrors = Record<string, string>

/**
 * Result from validateQuotas
 */
export interface QuotaValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Result from validateQuotaTemplate
 */
export interface TemplateValidationResult {
  valid: boolean
  errors: string[]
}

// ============================================
// Storage Types
// ============================================

/**
 * Result from localStorage operations
 */
export interface StorageResult {
  success: boolean
  error?: 'quota' | 'not_found' | 'unknown'
  message?: string
}

/**
 * Result from addTemplate operation
 */
export interface AddTemplateResult extends StorageResult {
  template?: QuotaTemplate
}

// ============================================
// Timer Types
// ============================================

/** Available sound preset keys */
export type SoundPresetKey =
  | 'classic'
  | 'high'
  | 'low'
  | 'double'
  | 'chirp'
  | 'buzz'
  | 'soft'
  | 'alert'
  | 'funky'
  | 'none'

/**
 * Sound configuration for timer events
 */
export interface TimerSounds {
  exercise: SoundPresetKey
  rest: SoundPresetKey
  finisher: SoundPresetKey
  warning: SoundPresetKey
  complete: SoundPresetKey
}

/**
 * Timer configuration state
 */
export interface TimerConfig {
  exerciseDuration: number
  restDuration: number
  rounds: number
  finisherDuration: number
  volume: number
  warningTime: number
  sounds: TimerSounds
}

/** Timer phase states */
export type TimerPhase = 'idle' | 'exercise' | 'rest' | 'finisher' | 'complete'

// ============================================
// Sound Preset Types
// ============================================

interface BaseSoundPreset {
  name: string
}

interface SilentPreset extends BaseSoundPreset {
  type: null
}

interface StandardPreset extends BaseSoundPreset {
  type: OscillatorType
  frequency: number
  duration: number
}

interface DoublePreset extends BaseSoundPreset {
  type: OscillatorType
  frequency: number
  duration: number
  pattern: 'double'
}

interface SweepPreset extends BaseSoundPreset {
  type: OscillatorType
  frequencyStart: number
  frequencyEnd: number
  duration: number
  pattern: 'sweep' | 'descend'
}

export type SoundPreset = SilentPreset | StandardPreset | DoublePreset | SweepPreset

export type SoundPresets = Record<SoundPresetKey, SoundPreset>

// ============================================
// Muscle Diagram Types
// ============================================

/**
 * Slugs supported by @mjcdev/react-body-highlighter
 */
export type MuscleSlug =
  | 'abs'
  | 'adductors'
  | 'ankles'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'deltoids'
  | 'feet'
  | 'forearm'
  | 'gluteal'
  | 'hamstring'
  | 'hands'
  | 'hair'
  | 'head'
  | 'knees'
  | 'lower-back'
  | 'neck'
  | 'obliques'
  | 'quadriceps'
  | 'tibialis'
  | 'trapezius'
  | 'triceps'
  | 'upper-back'

/**
 * Our application's muscle group names
 */
export type MuscleGroupName =
  | 'Chest'
  | 'Shoulders'
  | 'Biceps'
  | 'Forearms'
  | 'Abdominals'
  | 'Obliques'
  | 'Quadriceps'
  | 'Back'
  | 'Lower Back'
  | 'Trapezius'
  | 'Triceps'
  | 'Glutes'
  | 'Hamstrings'
  | 'Calves'
  | 'Adductors'

/** Map from our muscle names to library slugs */
export type MuscleNameMap = Record<MuscleGroupName, MuscleSlug>

/** Map from library slugs to our muscle names */
export type ReverseMuscleNameMap = Partial<Record<MuscleSlug, MuscleGroupName>>

// ============================================
// App View State
// ============================================

/** Current view in the app */
export type AppView = 'list' | 'create' | 'edit' | 'detail'

/** Theme preference */
export type Theme = 'dark' | 'light'

// ============================================
// Drag and Drop Types
// ============================================

/** Position indicator for drag-drop */
export type DragPosition = 'before' | 'after'

/**
 * Drag and drop state for exercise reordering
 */
export interface DragState {
  draggedIndex: number | null
  dragOverIndex: number | null
  dragOverPosition: DragPosition | null
  dragOverRound: number | null
}

// ============================================
// Reroll Types (Feature 005)
// ============================================

/**
 * History of recently shown exercises per position
 * Key is the position index, value is array of exercise IDs
 */
export type RerollHistory = Record<number, string[]>

// ============================================
// Exercise Group Types (Circuit Mode)
// ============================================

/**
 * Exercise with its original index (for circuit mode display)
 */
export interface IndexedExercise extends PlanExercise {
  originalIndex: number
}

/**
 * Exercise group for circuit mode
 */
export interface ExerciseGroup {
  groupIndex: number
  exercises: PlanExercise[]
}
