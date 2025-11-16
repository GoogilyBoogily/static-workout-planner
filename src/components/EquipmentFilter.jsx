import './EquipmentFilter.css'

/**
 * EquipmentFilter Component
 *
 * Clickable pills for filtering exercises by required equipment.
 *
 * @param {Object} props
 * @param {string[]} props.availableEquipment - All unique equipment from exercises
 * @param {string[]} props.selectedEquipment - Currently selected equipment
 * @param {Function} props.onEquipmentToggle - Callback when equipment is clicked
 */
function EquipmentFilter({ availableEquipment = [], selectedEquipment = [], onEquipmentToggle }) {
  if (availableEquipment.length === 0) {
    return null
  }

  const handleClick = (equipment) => {
    if (onEquipmentToggle) {
      onEquipmentToggle(equipment)
    }
  }

  const handleKeyDown = (event, equipment) => {
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
