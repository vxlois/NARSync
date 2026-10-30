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
  { value: 'all', label: 'All submissions' },
  { value: 'timed-in', label: 'Timed in (any)' },
  { value: 'completed', label: 'Time in and out' },
  { value: 'on-duty', label: 'On duty (no time out)' },
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
  const completedCount = filteredRecords.filter((record) => record.timeIn && record.timeOut).length
  const openFlagCount = filteredRecords.filter((record) => record.flag?.status === 'Open').length
  const lateCount = filteredRecords.filter((record) => getRecordStatus(record).key === 'late').length

  const resetFilters = () => {
    setSearch('')
    setDate('')
    setGroupId('all')
    setYearLevel('all')
    setLocationId('all')
    setStatus('all')
    setView('all')
  }

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
        eyebrow="Evidence ledger"
        title="Attendance records"
        meta={
          <>
            <span className="adm-meta-pill"><strong>{filteredRecords.length}</strong> records</span>
            <span className="adm-meta-pill"><strong>{completedCount}</strong> completed</span>
            <span className="adm-meta-pill"><strong>{lateCount}</strong> late</span>
            <span className="adm-meta-pill"><strong>{openFlagCount}</strong> open flags</span>
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
            Search and filters
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
              placeholder="Search student, ID, group, or location"
              aria-label="Search attendance records"
            />
          </label>
          <label className="adm-field adm-field--inline">
            <span>Duty date</span>
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
            <span>Quick view</span>
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
            <h3>Attendance ledger</h3>
            <p>{filteredRecords.length} records match the current filters.</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE))}
          </span>
        </div>

        {pageRecords.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Group</th>
                    <th>Duty date</th>
                    <th>Clinical location</th>
                    <th>Time in</th>
                    <th>Time out</th>
                    <th>Status</th>
                    <th>Flag</th>
                    <th className="adm-table__action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.map((record) => {
                    const student = getStudentById(students, record.studentId)
                    const group = getGroupById(groups, record.groupId)
                    const location = getLocationById(locations, record.locationId)
                    const recordStatus = getRecordStatus(record)
                    return (
                      <tr key={record.id}>
                        <td>
                          <div className="adm-person">
                            <Avatar name={student?.name || 'Unknown student'} size="sm" />
                            <div>
                              <strong>{student?.name || 'Unknown student'}</strong>
                              <span>{student?.yearLevel}</span>
                            </div>
                          </div>
                        </td>
                        <td className="adm-mono">{record.studentId}</td>
                        <td>{group?.name || '—'}</td>
                        <td>{formatDateMedium(record.date)}</td>
                        <td>{location?.name || '—'}</td>
                        <td className="adm-mono">{formatTime(record.timeIn)}</td>
                        <td className="adm-mono">{formatTime(record.timeOut)}</td>
                        <td>
                          <StatusBadge tone={recordStatus.tone}>{recordStatus.label}</StatusBadge>
                        </td>
                        <td>
                          {record.flag ? (
                            <StatusBadge tone={record.flag.status === 'Open' ? 'danger' : 'success'}>
                              {record.flag.status}
                            </StatusBadge>
                          ) : (
                            <span className="adm-muted">None</span>
                          )}
                        </td>
                        <td className="adm-table__action">
                          <button
                            type="button"
                            className="adm-text-btn"
                            onClick={() => setSelectedRecord(record)}
                          >
                            View
                          </button>
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
            title="No attendance records found"
            description="Adjust the search or filters to find a submission."
            action={
              <button type="button" className="adm-btn adm-btn--secondary" onClick={resetFilters}>
                Clear filters
              </button>
            }
          />
        )}
      </section>

      <Drawer
        open={Boolean(selectedRecord)}
        title="Attendance record"
        subtitle={
          selectedRecord
            ? `${getStudentById(students, selectedRecord.studentId)?.name} · ${formatDateMedium(selectedRecord.date)}`
            : ''
        }
        onClose={() => setSelectedRecord(null)}
        size="lg"
      >
        {selectedRecord && <RecordDetailPanel record={selectedRecord} />}
      </Drawer>
    </div>
  )
}
