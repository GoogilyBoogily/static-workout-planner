import type { KeyboardEvent } from 'react'
import './EquipmentFilter.css'

import type { EquipmentFilterProps } from '../types/components'

/**
 * EquipmentFilter Component
 *
 * Clickable pills for filtering exercises by required equipment.
 */
function EquipmentFilter({ availableEquipment = [], selectedEquipment = [], onEquipmentToggle }: EquipmentFilterProps) {
  if (availableEquipment.length === 0) {
    return null
  }

  const handleClick = (equipment: string) => {
    if (onEquipmentToggle) {
      onEquipmentToggle(equipment)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, equipment: string) => {
    // Support keyboard activation (Enter or Space)
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick(equipment)
    }
  }

  return (
    <div className="equipment-filter">
      <div className="equipment-filter-label">Filter by equipment:</div>
      <div className="equipment-filter-pills">
        {availableEquipment.map((equipment) => {
          const isSelected = selectedEquipment.includes(equipment)
          return (
            <button
              key={equipment}
              className={`equipment-pill ${isSelected ? 'equipment-pill-active' : ''}`}
              onClick={() => handleClick(equipment)}
              onKeyDown={(e) => handleKeyDown(e, equipment)}
              aria-pressed={isSelected}
              aria-label={`Filter by ${equipment}`}
              type="button"
            >
              {equipment}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default EquipmentFilter
