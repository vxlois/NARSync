import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Info,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import {
  getGroupById,
  getLocationById,
  getScheduleStatus,
  INSTRUCTORS,
  isScheduleComplete,
  scheduleWarnings,
} from '../adminData'
import { useToast } from '../../context/ToastContext'
import { dateKey, formatDateMedium, formatDateLong } from '../../utils/format'
import Drawer from '../components/Drawer'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import ViewOnlyNotice from '../components/ViewOnlyNotice'

const PAGE_SIZE = 8
const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'ready', label: 'Ready' },
  { value: 'draft', label: 'Draft' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function ScheduleDrawer({ schedule, onClose }) {
  const { groups, locations, saveSchedule } = useAdmin()
  const { toast } = useToast()
  const [form, setForm] = useState({
    groupId: schedule?.groupId || '',
    locationId: schedule?.locationId || '',
    date: schedule?.date || dateKey(),
    startTime: schedule?.startTime || '07:00',
    endTime: schedule?.endTime || '15:00',
    instructor: schedule?.instructor || '',
    notes: schedule?.notes || '',
    status: schedule?.status || 'Draft',
  })
  const [error, setError] = useState('')
  const warnings = scheduleWarnings(form)
  const derivedStatus = getScheduleStatus(form)

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const handleSave = () => {
    if (!form.groupId || !form.locationId || !form.date) {
      setError('Fill in the required fields.')
      return
    }
    if (!form.startTime || !form.endTime) {
      setError('Set a start and end time.')
      return
    }
    if (form.endTime <= form.startTime) {
      setError('End time must be later than start time.')
      return
    }
    if (form.status === 'Ready' && !isScheduleComplete(form)) {
      setError('Complete all fields before marking it ready.')
      return
    }
    saveSchedule(schedule?.id, {
      ...form,
      instructor: form.instructor || 'Not assigned',
      notes: form.notes.trim(),
    })
    toast(
      schedule
        ? 'Schedule updated.'
        : form.status === 'Ready'
          ? 'Schedule created and ready.'
          : 'Draft saved.',
      'success',
    )
    onClose()
  }

  return (
    <Drawer
      open
      title={schedule ? 'Edit schedule' : 'New schedule'}
      subtitle={
        schedule
          ? `${formatDateLong(schedule.date)} · ${getGroupById(groups, schedule.groupId)?.name}`
          : undefined
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className="adm-btn adm-btn--primary" 
            onClick={handleSave}
            style={{ opacity: 1, backgroundColor: '#7c3aed', color: '#ffffff', cursor: 'pointer' }}
          >
            {schedule ? 'Save changes' : 'Save schedule'}
          </button>
        </>
      }
    >
      <div className={`adm-schedule-state adm-schedule-state--${derivedStatus.tone}`}>
        <span className="adm-schedule-state__icon" aria-hidden="true">
          {derivedStatus.key === 'ready' ? (
            <CheckCircle2 size={17} />
          ) : (
            <AlertTriangle size={17} />
          )}
        </span>
        <div>
          <strong>{derivedStatus.label}</strong>
          <p>
            {derivedStatus.attendanceReady
              ? 'Attendance can open.'
              : 'Attendance stays locked until this schedule is ready.'}
          </p>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="adm-validation-note">
          <p>
            <Info size={15} aria-hidden="true" /> Missing details
          </p>
          <ul>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="adm-form-grid">
        <label className="adm-field">
          <span>Group *</span>
          <select value={form.groupId} onChange={(event) => update('groupId', event.target.value)}>
            <option value="">Select a group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-field">
          <span>Location *</span>
          <select
            value={form.locationId}
            onChange={(event) => update('locationId', event.target.value)}
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}{location.status === 'Inactive' ? ' (inactive)' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-field">
          <span>Date *</span>
          <input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} />
        </label>

        <label className="adm-field">
          <span>Instructor</span>
          <select
            value={form.instructor}
            onChange={(event) => update('instructor', event.target.value)}
          >
            <option value="">Not assigned</option>
            {INSTRUCTORS.map((instructor) => (
              <option key={instructor} value={instructor}>
                {instructor}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-field">
          <span>Start time *</span>
          <input
            type="time"
            value={form.startTime}
            onChange={(event) => update('startTime', event.target.value)}
          />
        </label>

        <label className="adm-field">
          <span>End time *</span>
          <input
            type="time"
            value={form.endTime}
            onChange={(event) => update('endTime', event.target.value)}
          />
        </label>

        <label className="adm-field">
          <span>Status</span>
          <select value={form.status} onChange={(event) => update('status', event.target.value)}>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>

        <label className="adm-field adm-field--wide">
          <span>Notes</span>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Optional notes"
          />
        </label>
      </div>

      {error && <p className="adm-form-error">{error}</p>}
    </Drawer>
  )
}

export default function AdminSchedulesPage() {
  const { schedules, groups, locations, canManage, publishSchedule } = useAdmin()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState(searchParams.get('group') || 'all')
  const [locationId, setLocationId] = useState(searchParams.get('location') || 'all')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [date, setDate] = useState(searchParams.get('date') || '')
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)

  useEffect(() => {
    setGroupId(searchParams.get('group') || 'all')
    setLocationId(searchParams.get('location') || 'all')
    setStatus(searchParams.get('status') || 'all')
    setDate(searchParams.get('date') || '')
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [search, groupId, locationId, status, date])

  const filteredSchedules = useMemo(() => {
    const term = search.trim().toLowerCase()
    return schedules
      .filter((schedule) => {
        if (groupId !== 'all' && schedule.groupId !== groupId) return false
        if (locationId !== 'all' && schedule.locationId !== locationId) return false
        if (status !== 'all' && getScheduleStatus(schedule).key !== status) return false
        if (date && schedule.date !== date) return false
        if (!term) return true
        const group = getGroupById(groups, schedule.groupId)
        const location = getLocationById(locations, schedule.locationId)
        return [group?.name, location?.name, schedule.instructor]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term))
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [schedules, groups, locations, search, groupId, locationId, status, date])

  const pageSchedules = filteredSchedules.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const readyCount = schedules.filter((schedule) => getScheduleStatus(schedule).key === 'ready').length
  const incompleteCount = schedules.filter(
    (schedule) => getScheduleStatus(schedule).key === 'incomplete',
  ).length
  const draftCount = schedules.filter((schedule) => getScheduleStatus(schedule).key === 'draft').length

  const resetFilters = () => {
    setSearch('')
    setGroupId('all')
    setLocationId('all')
    setStatus('all')
    setDate('')
  }

  const applyQuickFilter = (filter) => {
    resetFilters()
    if (filter === 'ready') setStatus('ready')
    if (filter === 'drafts') setStatus('draft')
    if (filter === 'incomplete') setStatus('incomplete')
  }

  const quickFilters = [
    { key: 'all', label: 'All', count: schedules.length },
    { key: 'ready', label: 'Ready', count: readyCount },
    { key: 'drafts', label: 'Drafts', count: draftCount },
    { key: 'incomplete', label: 'Incomplete', count: incompleteCount },
  ]

  const activeQuickFilter =
    status === 'ready'
      ? 'ready'
      : status === 'draft'
        ? 'drafts'
        : status === 'incomplete'
          ? 'incomplete'
          : !search.trim() && groupId === 'all' && locationId === 'all' && !date
            ? 'all'
            : ''

  const openCreate = () => {
    setEditingSchedule(null)
    setDrawerOpen(true)
  }

  const openEdit = (schedule) => {
    setEditingSchedule(schedule)
    setDrawerOpen(true)
  }

  const handlePublish = (schedule) => {
    try {
      publishSchedule(schedule.id)
      toast('Schedule published.', 'success')
    } catch (error) {
      toast(error.message, 'danger')
    }
  }

  return (
    <div className="adm-page">
      <PageIntro
        meta={
          <>
            {quickFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`adm-quick-filter ${activeQuickFilter === filter.key ? 'is-active' : ''}`}
                onClick={() => applyQuickFilter(filter.key)}
                aria-pressed={activeQuickFilter === filter.key}
              >
                <strong>{filter.count}</strong> {filter.label}
              </button>
            ))}
          </>
        }
        actions={
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={openCreate}
            disabled={!canManage}
            title={!canManage ? 'Department Head access is view-only.' : undefined}
          >
            <Plus size={16} aria-hidden="true" />
            Create schedule
          </button>
        }
      />

      {!canManage && (
        <ViewOnlyNotice message="View only. Schedules can't be changed." />
      )}

      <section className="adm-filter-card" aria-label="Schedule filters">
        <div className="adm-filter-card__head">
          <span>
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filters
          </span>
          <button type="button" className="adm-text-btn" onClick={resetFilters}>
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
        </div>
        <div className="adm-filters adm-filters--students">
          <label className="adm-search-field">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search group, location, or instructor"
              aria-label="Search duty schedules"
            />
          </label>
          <label className="adm-field adm-field--inline">
            <span>Group</span>
            <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
              <option value="all">All groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Location</span>
            <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
              <option value="all">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="adm-card adm-card--table">
        <div className="adm-table-head">
          <div>
            <h3>Schedules</h3>
            <p>{filteredSchedules.length} shown</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filteredSchedules.length / PAGE_SIZE))}
          </span>
        </div>

        {pageSchedules.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table adm-table--fit">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Group</th>
                    <th>Instructor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSchedules.map((schedule) => {
                    const group = getGroupById(groups, schedule.groupId)
                    const location = getLocationById(locations, schedule.locationId)
                    const scheduleStatus = getScheduleStatus(schedule)
                    const complete = isScheduleComplete(schedule)
                    return (
                      <tr
                        key={schedule.id}
                        className={canManage ? 'adm-table__row--clickable' : undefined}
                        onClick={canManage ? () => openEdit(schedule) : undefined}
                      >
                        <td>
                          <div className="adm-cell-stack">
                            <span className="adm-date-cell">
                              <button
                                type="button"
                                className="adm-table-link"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  if (canManage) openEdit(schedule)
                                }}
                                disabled={!canManage}
                              >
                                {formatDateMedium(schedule.date)}
                              </button>
                              {schedule.date === dateKey() && <span className="adm-today-tag">Today</span>}
                            </span>
                            <span className="adm-cell-sub adm-mono">
                              {schedule.startTime || '—'}–{schedule.endTime || '—'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="adm-cell-stack">
                            <strong>{group?.name || 'Not assigned'}</strong>
                            <span className="adm-cell-sub">{location?.name || 'No location'}</span>
                          </div>
                        </td>
                        <td>{schedule.instructor || <span className="adm-muted">Not assigned</span>}</td>
                        <td>
                          <div className="adm-cell-stack">
                            <span className="adm-status-line">
                              <StatusBadge tone={scheduleStatus.tone}>{scheduleStatus.label}</StatusBadge>
                              {canManage && scheduleStatus.key === 'draft' && complete && (
                                <button
                                  type="button"
                                  className="adm-text-btn adm-text-btn--sm"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handlePublish(schedule)
                                  }}
                                >
                                  Publish
                                </button>
                              )}
                            </span>
                            <span className="adm-cell-sub">
                              {scheduleStatus.attendanceReady ? 'Attendance open' : 'Attendance locked'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filteredSchedules.length}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No schedules"
            description={
              schedules.length
                ? 'Adjust the filters to see more.'
                : 'Create a schedule to get started.'
            }
            action={
              schedules.length ? (
                <button type="button" className="adm-btn adm-btn--secondary" onClick={resetFilters}>
                  Clear filters
                </button>
              ) : canManage ? (
                <button type="button" className="adm-btn adm-btn--primary" onClick={openCreate}>
                  <Plus size={16} aria-hidden="true" />
                  Create schedule
                </button>
              ) : null
            }
          />
        )}
      </section>

      {drawerOpen && (
        <ScheduleDrawer
          schedule={editingSchedule}
          onClose={() => {
            setDrawerOpen(false)
            setEditingSchedule(null)
          }}
        />
      )}
    </div>
  )
}
