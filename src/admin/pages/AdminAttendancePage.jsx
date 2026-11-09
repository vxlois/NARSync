import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ClipboardList,
  Download,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import {
  getGroupById,
  getLocationById,
  getRecordStatus,
  getStudentById,
  YEAR_LEVELS,
} from '../adminData'
import { useToast } from '../../context/ToastContext'
import { dateKey, formatDateMedium, formatTime } from '../../utils/format'
import { downloadCsv } from '../utils/csv'
import Avatar from '../components/Avatar'
import Drawer from '../components/Drawer'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import Pagination from '../components/Pagination'
import RecordDetailPanel from '../components/RecordDetailPanel'
import StatusBadge from '../components/StatusBadge'

const PAGE_SIZE = 10
const RECORD_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'late', label: 'Late' },
  { value: 'timed-in', label: 'Timed in' },
  { value: 'missing-out', label: 'Missing time out' },
  { value: 'flagged', label: 'Flagged' },
]
const RECORD_VIEWS = [
  { value: 'all', label: 'All' },
  { value: 'timed-in', label: 'Timed in' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-duty', label: 'On duty' },
]

export default function AdminAttendancePage() {
  const { records, students, groups, locations } = useAdmin()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('student') || '')
  const [date, setDate] = useState(searchParams.get('date') || '')
  const [groupId, setGroupId] = useState(searchParams.get('group') || 'all')
  const [yearLevel, setYearLevel] = useState(searchParams.get('year') || 'all')
  const [locationId, setLocationId] = useState(searchParams.get('location') || 'all')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [view, setView] = useState(searchParams.get('view') || 'all')
  const [page, setPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    setSearch(searchParams.get('student') || '')
    setDate(searchParams.get('date') || '')
    setGroupId(searchParams.get('group') || 'all')
    setYearLevel(searchParams.get('year') || 'all')
    setLocationId(searchParams.get('location') || 'all')
    setStatus(searchParams.get('status') || 'all')
    setView(searchParams.get('view') || 'all')
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [search, date, groupId, yearLevel, locationId, status, view])

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase()
    return records.filter((record) => {
      const student = getStudentById(students, record.studentId)
      const group = getGroupById(groups, record.groupId)
      const location = getLocationById(locations, record.locationId)
      if (date && record.date !== date) return false
      if (groupId !== 'all' && record.groupId !== groupId) return false
      if (yearLevel !== 'all' && student?.yearLevel !== yearLevel) return false
      if (locationId !== 'all' && record.locationId !== locationId) return false
      if (status !== 'all' && getRecordStatus(record).key !== status) return false
      if (view === 'timed-in' && !record.timeIn) return false
      if (view === 'completed' && !(record.timeIn && record.timeOut)) return false
      if (view === 'on-duty' && !(record.timeIn && !record.timeOut)) return false
      if (!term) return true
      return [student?.name, student?.id, group?.name, location?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [records, students, groups, locations, search, date, groupId, yearLevel, locationId, status, view])

  const pageRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const completedCount = records.filter((record) => getRecordStatus(record).key === 'completed').length
  const flaggedCount = records.filter((record) => record.flag?.status === 'Open').length
  const lateCount = records.filter((record) => getRecordStatus(record).key === 'late').length

  const resetFilters = () => {
    setSearch('')
    setDate('')
    setGroupId('all')
    setYearLevel('all')
    setLocationId('all')
    setStatus('all')
    setView('all')
  }

  const applyQuickFilter = (filter) => {
    resetFilters()
    if (filter !== 'all') setStatus(filter)
  }

  const quickFilters = [
    { key: 'all', label: 'All', count: records.length },
    { key: 'completed', label: 'Completed', count: completedCount },
    { key: 'late', label: 'Late', count: lateCount },
    { key: 'flagged', label: 'Flagged', count: flaggedCount },
  ]

  const activeQuickFilter =
    status === 'completed'
      ? 'completed'
      : status === 'late'
        ? 'late'
        : status === 'flagged'
          ? 'flagged'
          : !search.trim() &&
              !date &&
              groupId === 'all' &&
              yearLevel === 'all' &&
              locationId === 'all' &&
              view === 'all'
            ? 'all'
            : ''

  const exportRecords = () => {
    downloadCsv(
      `narsync-attendance-${dateKey()}.csv`,
      ['Date', 'Student ID', 'Student', 'Group', 'Location', 'Time in', 'Time out', 'Status', 'Flag'],
      filteredRecords.map((record) => {
        const student = getStudentById(students, record.studentId)
        const group = getGroupById(groups, record.groupId)
        const location = getLocationById(locations, record.locationId)
        const recordStatus = getRecordStatus(record)
        return [
          record.date,
          record.studentId,
          student?.name,
          group?.name,
          location?.name,
          formatTime(record.timeIn),
          formatTime(record.timeOut),
          recordStatus.label,
          record.flag?.status || 'None',
        ]
      }),
    )
    toast('Attendance records exported as CSV.', 'success')
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
          <button type="button" className="adm-btn adm-btn--secondary" onClick={exportRecords}>
            <Download size={16} aria-hidden="true" />
            Export CSV
          </button>
        }
      />

      <section className="adm-filter-card" aria-label="Attendance filters">
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
              placeholder="Search student, group, or location"
              aria-label="Search attendance records"
            />
          </label>
          <label className="adm-field adm-field--inline">
            <span>Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="adm-field adm-field--inline">
            <span>Group</span>
            <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
              <option value="all">All groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Year level</span>
            <select value={yearLevel} onChange={(event) => setYearLevel(event.target.value)}>
              <option value="all">All years</option>
              {YEAR_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Location</span>
            <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
              <option value="all">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {RECORD_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>View</span>
            <select value={view} onChange={(event) => setView(event.target.value)}>
              {RECORD_VIEWS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="adm-card adm-card--table">
        <div className="adm-table-head">
          <div>
            <h3>Records</h3>
            <p>{filteredRecords.length} shown</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE))}
          </span>
        </div>

        {pageRecords.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table adm-table--fit">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Group</th>
                    <th>Duty date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.map((record) => {
                    const student = getStudentById(students, record.studentId)
                    const group = getGroupById(groups, record.groupId)
                    const location = getLocationById(locations, record.locationId)
                    const recordStatus = getRecordStatus(record)
                    return (
                      <tr
                        key={record.id}
                        className="adm-table__row--clickable"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <td>
                          <div className="adm-person">
                            <Avatar name={student?.name || 'Unknown student'} size="sm" />
                            <div>
                              <strong>{student?.name || 'Unknown student'}</strong>
                              <span>
                                {record.studentId}
                                {student?.yearLevel ? ` · ${student.yearLevel}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="adm-cell-stack">
                            <strong>{group?.name || 'No group'}</strong>
                            <span className="adm-cell-sub">{location?.name || 'No location'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="adm-cell-stack">
                            <strong>{formatDateMedium(record.date)}</strong>
                            <span className="adm-cell-sub adm-mono">
                              {formatTime(record.timeIn)} · {formatTime(record.timeOut)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="adm-cell-stack">
                            <StatusBadge tone={recordStatus.tone}>{recordStatus.label}</StatusBadge>
                            <span className="adm-cell-sub">
                              {record.flag ? `Flag ${record.flag.status.toLowerCase()}` : 'No flag'}
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
              total={filteredRecords.length}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No records"
            description={
              records.length
                ? 'Adjust the filters to see more.'
                : 'Attendance records will appear here once students submit.'
            }
            action={
              records.length ? (
                <button type="button" className="adm-btn adm-btn--secondary" onClick={resetFilters}>
                  Clear filters
                </button>
              ) : null
            }
          />
        )}
      </section>

      <Drawer
        open={Boolean(selectedRecord)}
        title="Record"
        onClose={() => setSelectedRecord(null)}
        size="lg"
      >
        {selectedRecord && <RecordDetailPanel record={selectedRecord} />}
      </Drawer>
    </div>
  )
}
