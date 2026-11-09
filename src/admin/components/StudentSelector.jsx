import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { getFaceStatus, getGroupById } from '../adminData'
import Avatar from './Avatar'
import StatusBadge from './StatusBadge'

export default function StudentSelector({
  students,
  groups,
  selectedIds,
  onChange,
  disabled = false,
  targetGroupId = null,
  emptyLabel = 'No students found.',
  showFaceStatus = true,
}) {
  const [search, setSearch] = useState('')
  const selectedSet = new Set(selectedIds)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return students
    return students.filter((student) => {
      const group = getGroupById(groups, student.groupId)
      return [student.name, student.id, group?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [students, groups, search])

  const toggle = (studentId) => {
    if (disabled) return
    if (selectedSet.has(studentId)) {
      onChange(selectedIds.filter((id) => id !== studentId))
    } else {
      onChange([...selectedIds, studentId])
    }
  }

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((student) => selectedSet.has(student.id))

  const toggleVisible = () => {
    if (disabled) return
    if (allVisibleSelected) {
      const visibleIds = new Set(filtered.map((student) => student.id))
      onChange(selectedIds.filter((id) => !visibleIds.has(id)))
      return
    }
    const next = new Set(selectedIds)
    filtered.forEach((student) => next.add(student.id))
    onChange([...next])
  }

  return (
    <div className="adm-student-selector">
      <div className="adm-student-selector__toolbar">
        <label className="adm-search-field">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, ID, or group"
            aria-label="Search students for group membership"
            disabled={disabled}
          />
        </label>
        <span className="adm-selector-count">{selectedIds.length} selected</span>
        {filtered.length > 0 && (
          <button
            type="button"
            className="adm-selector-toggle"
            onClick={toggleVisible}
            disabled={disabled}
            title={allVisibleSelected ? 'Clear visible students' : 'Select all visible students'}
          >
            {allVisibleSelected ? 'Clear' : 'Select all'}
          </button>
        )}
      </div>

      <div className="adm-selector-list">
        {filtered.length ? (
          filtered.map((student) => {
            const currentGroup = getGroupById(groups, student.groupId)
            const face = getFaceStatus(student)
            const selected = selectedSet.has(student.id)
            const moving = selected && currentGroup && currentGroup.id !== targetGroupId
            return (
              <label
                key={student.id}
                className={`adm-selector-row ${showFaceStatus ? '' : 'adm-selector-row--no-face'} ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(student.id)}
                  disabled={disabled}
                />
                <Avatar name={student.name} size="sm" />
                <span className="adm-selector-row__main">
                  <strong>{student.name}</strong>
                  <span>
                    {student.id} · {student.yearLevel}
                  </span>
                </span>
                <span className="adm-selector-row__group">
                  {moving ? (
                    <>
                      <StatusBadge tone="warning">Moves from {currentGroup.name}</StatusBadge>
                    </>
                  ) : currentGroup ? (
                    <span>{currentGroup.name}</span>
                  ) : (
                    <span>Unassigned</span>
                  )}
                </span>
                {showFaceStatus && <StatusBadge tone={face.tone}>{face.label}</StatusBadge>}
              </label>
            )
          })
        ) : (
          <p className="adm-selector-empty">{emptyLabel}</p>
        )}
      </div>
      <p className="adm-fineprint">
        Students belong to one group at a time. Selecting someone from another group moves them on save.
      </p>
    </div>
  )
}
