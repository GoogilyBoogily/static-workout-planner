/**
 * Component Prop Types for Workout Planner
 *
 * This file contains TypeScript interfaces for all React component props.
 * Import from '@/types/components' or '../types/components' as needed.
 */

import type {
  ParsedExercise,
  PlanExercise,
  WorkoutPlan,
  ExercisePool,
  TagQuota,
  QuotaTemplate,
  Theme,
  MuscleSlug
} from './index'

// ============================================
// Exercise Library Components
// ============================================

/**
 * Props for ExerciseList component
 */
export interface ExerciseListProps {
  /** Array of exercises to display */
  exercises: ParsedExercise[]
  /** Callback when an exercise is clicked */
  onExerciseClick: (exercise: ParsedExercise, index: number) => void
  /** Callback when an exercise is hovered (passes array of muscle tags or empty array) */
  onExerciseHover?: (tags: string[]) => void
  /** Optional message when no exercises are available */
  emptyMessage?: string
  /** Array of currently hovered muscles from diagram or exercise hover */
  hoveredMuscle?: string[]
}

/**
 * Props for ExerciseDetailModal component
 */
export interface ExerciseDetailModalProps {
  /** Exercise object to display (null = modal closed) */
  exercise: ParsedExercise | PlanExercise | null
  /** Index in exercises array */
  exerciseIndex: number | null
  /** Total number of exercises */
  totalExercises: number
  /** Callback to close modal */
  onClose: () => void
  /** Callback to navigate to next exercise */
  onNext: () => void
  /** Callback to navigate to previous exercise */
  onPrevious: () => void
}

/**
 * Props for ExerciseForm component
 */
export interface ExerciseFormProps {
  /** Exercise to edit (null for new exercise) */
  exercise: PlanExercise | null
  /** Array of exercises from loaded CSV data */
  exerciseLibrary: ParsedExercise[]
  /** Callback when exercise is saved */
  onSave: (exercise: PlanExercise) => void
  /** Callback when form is cancelled */
  onCancel: () => void
}

// ============================================
// Workout Plan Components
// ============================================

/**
 * Props for PlanList component
 */
export interface PlanListProps {
  /** Array of plan objects sorted by updatedAt desc */
  plans: WorkoutPlan[]
  /** Callback when "Create New Plan" is clicked */
  onCreate: () => void
  /** Callback when editing a plan */
  onEdit: (plan: WorkoutPlan) => void
  /** Callback when deleting a plan */
  onDelete: (plan: WorkoutPlan) => void
  /** Callback when viewing plan details */
  onView: (plan: WorkoutPlan) => void
  /** Callback when "Generate Random Workout" is clicked */
  onGenerateRandom: () => void
  /** True if no exercises available for generation */
  exercisePoolEmpty?: boolean
  /** Callback when starting circuit timer */
  onStartTimer: (plan: WorkoutPlan) => void
}

/**
 * Props for PlanForm component
 */
export interface PlanFormProps {
  /** Plan to edit (null for new plan) */
  plan: WorkoutPlan | null
  /** Callback when plan is saved */
  onSave: (planData: {
    name: string
    exercises: PlanExercise[]
    isCircuit: boolean
    pinStatus?: Record<string, boolean>
  }) => void
  /** Callback when form is cancelled */
  onCancel: () => void
  /** Exercise pool for reroll functionality */
  exercisePool?: ExercisePool
  /** Array of exercises from loaded CSV data */
  exerciseLibrary?: ParsedExercise[]
  /** Whether this plan was randomly generated */
  isGenerated?: boolean
}

/**
 * Props for PlanDetail component
 */
export interface PlanDetailProps {
  /** Plan object to display */
  plan: WorkoutPlan
  /** Callback when modal is closed */
  onClose: () => void
}

// ============================================
// Random Generation Components
// ============================================

/**
 * Props for QuotaForm component
 */
export interface QuotaFormProps {
  /** Tags from exercise pool */
  availableTags: string[]
  /** Exercise pool grouped by tag */
  exercisePool: ExercisePool
  /** Saved quota templates */
  quotaTemplates?: QuotaTemplate[]
  /** Callback when "Generate" clicked */
  onGenerate: (quotas: TagQuota[]) => void
  /** Callback when cancelled */
  onCancel: () => void
  /** Callback to save template */
  onSaveTemplate: (name: string, quotas: TagQuota[]) => void
  /** Callback to delete template */
  onDeleteTemplate: (templateId: string) => void
}

/**
 * Props for QuotaTemplateManager component
 */
export interface QuotaTemplateManagerProps {
  /** Array of saved quota templates */
  templates: QuotaTemplate[]
  /** Callback when template loaded */
  onLoad: (template: QuotaTemplate) => void
  /** Callback when template deleted */
  onDelete: (templateId: string) => void
}

// ============================================
// Timer Components
// ============================================

/**
 * Props for CircuitTimer component
 */
export interface CircuitTimerProps {
  /** Callback to close timer and return to plan list */
  onClose: () => void
  /** The workout plan to use with the timer */
  plan: WorkoutPlan
  /** Callback to update plan when exercises are reordered */
  onUpdatePlan: (plan: WorkoutPlan) => void
}

// ============================================
// Muscle Diagram Components
// ============================================

/**
 * Props for MuscleDiagram component
 */
export interface MuscleDiagramProps {
  /** Array of selected muscle names (our naming) */
  selectedMuscles?: string[]
  /** Callback when muscle is clicked */
  onMuscleToggle?: (muscleName: string) => void
  /** Array of currently hovered muscle names */
  hoveredMuscle?: string[]
  /** Callback when muscle is hovered */
  onMuscleHover?: (muscles: string[]) => void
  /** Array of library muscle slugs that have exercises (others are disabled) */
  availableMuscles?: MuscleSlug[]
}

// ============================================
// Filter Components
// ============================================

/**
 * Props for SearchInput component
 */
export interface SearchInputProps {
  /** Current search text value */
  value: string
  /** Callback when search text changes */
  onChange: (value: string) => void
  /** Placeholder text for the input */
  placeholder?: string
}

/**
 * Props for TagFilter component
 */
export interface TagFilterProps {
  /** All unique tags/muscle groups from exercises */
  availableTags?: string[]
  /** Currently selected tags (synced with selectedMuscles) */
  selectedTags?: string[]
  /** Callback when a tag is clicked */
  onTagToggle?: (tag: string) => void
}

/**
 * Props for EquipmentFilter component
 */
export interface EquipmentFilterProps {
  /** All unique equipment from exercises */
  availableEquipment?: string[]
  /** Currently selected equipment */
  selectedEquipment?: string[]
  /** Callback when equipment is clicked */
  onEquipmentToggle?: (equipment: string) => void
}

// ============================================
// UI Components
// ============================================

/**
 * Props for ErrorMessage component
 */
export interface ErrorMessageProps {
  /** Error message to display (null hides component) */
  message: string | null
  /** Optional callback when error is dismissed */
  onDismiss?: () => void
}

/**
 * Props for StorageWarning component
 */
export interface StorageWarningProps {
  /** Whether to show the warning */
  show: boolean
  /** Warning message to display */
  message: string
  /** Optional callback when warning is dismissed */
  onDismiss?: () => void
}

/**
 * Props for ThemeToggle component
 */
export interface ThemeToggleProps {
  /** Current theme ('dark' or 'light') */
  theme: Theme
  /** Callback when theme changes */
  onToggle: () => void
}
