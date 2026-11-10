import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  LogIn,
  LogOut,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import {
  getAttendanceSummary,
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
import Pagination from '../components/Pagination'
import RecordDetailPanel from '../components/RecordDetailPanel'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

const PAGE_SIZE = 10
const RECORD_STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'late', label: 'Late' },
  { value: 'timed-in', label: 'On duty' },
  { value: 'missing-out', label: 'Missing time out' },
  { value: 'absent', label: 'Absent' },
]

export default function AdminAttendancePage() {
  const { records, students, groups, locations } = useAdmin()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('student') || '')
  const [fromDate, setFromDate] = useState(searchParams.get('from') || searchParams.get('date') || '')
  const [toDate, setToDate] = useState(searchParams.get('to') || searchParams.get('date') || '')
  const [groupId, setGroupId] = useState(searchParams.get('group') || 'all')
  const [yearLevel, setYearLevel] = useState(searchParams.get('year') || 'all')
  const [locationId, setLocationId] = useState(searchParams.get('location') || 'all')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [page, setPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    const date = searchParams.get('date') || ''
    setSearch(searchParams.get('student') || '')
    setFromDate(searchParams.get('from') || date)
    setToDate(searchParams.get('to') || date)
    setGroupId(searchParams.get('group') || 'all')
    setYearLevel(searchParams.get('year') || 'all')
    setLocationId(searchParams.get('location') || 'all')
    setStatus(searchParams.get('status') || 'all')
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [search, fromDate, toDate, groupId, yearLevel, locationId, status])

  const scopedRecords = useMemo(() => {
    const term = search.trim().toLowerCase()
    return records.filter((record) => {
      const student = getStudentById(students, record.studentId)
      const group = getGroupById(groups, record.groupId)
      const location = getLocationById(locations, record.locationId)
      if (fromDate && record.date < fromDate) return false
      if (toDate && record.date > toDate) return false
      if (groupId !== 'all' && record.groupId !== groupId) return false
      if (yearLevel !== 'all' && student?.yearLevel !== yearLevel) return false
      if (locationId !== 'all' && record.locationId !== locationId) return false
      if (!term) return true
      return [student?.name, student?.id, group?.name, location?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [
    records,
    students,
    groups,
    locations,
    search,
    fromDate,
    toDate,
    groupId,
    yearLevel,
    locationId,
  ])

  const filteredRecords = useMemo(
    () =>
      status === 'all'
        ? scopedRecords
        : scopedRecords.filter((record) => getRecordStatus(record).key === status),
    [scopedRecords, status],
  )

  const summary = useMemo(() => getAttendanceSummary(scopedRecords), [scopedRecords])

  const pageRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const percent = (value) => (summary.total ? (value / summary.total) * 100 : 0)

  const resetFilters = () => {
    setSearch('')
    setFromDate('')
    setToDate('')
    setGroupId('all')
    setYearLevel('all')
    setLocationId('all')
    setStatus('all')
  }

  const exportRecords = () => {
    downloadCsv(
      `narsync-attendance-${dateKey()}.csv`,
      ['Date', 'Student ID', 'Student', 'Group', 'Location', 'Time in', 'Time out', 'Status'],
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
        ]
      }),
    )
    toast('Attendance records exported as CSV.', 'success')
  }

  return (
    <div className="adm-page">
      <section className="adm-stat-grid" aria-label="Attendance summary">
        <StatCard
          icon={ClipboardList}
          label="Records"
          value={summary.total}
          tone="blue"
          onClick={() => setStatus('all')}
          hint="Show all records"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={summary.completed}
          note={`${summary.punctualityRate}% on time`}
          tone="green"
          onClick={() => setStatus('completed')}
          hint="Filter completed records"
        />
        <StatCard
          icon={Clock3}
          label="Late"
          value={summary.late}
          tone="amber"
          onClick={() => setStatus('late')}
          hint="Filter late records"
        />
        <StatCard
          icon={LogIn}
          label="On duty"
          value={summary.timedIn}
          note="Today"
          tone="teal"
          onClick={() => setStatus('timed-in')}
          hint="Filter records on duty"
        />
        <StatCard
          icon={LogOut}
          label="Missing time out"
          value={summary.missingOut}
          note="Past duties"
          tone="red"
          onClick={() => setStatus('missing-out')}
          hint="Filter records missing a time out"
        />
      </section>

      <section className="adm-card adm-progress-hero" aria-label="Attendance rate">
        <div className="adm-progress-hero__top">
          <strong>{summary.completionRate}%</strong>
          <span>attended</span>
        </div>
        <div
          className="adm-segmented-bar"
          role="img"
          aria-label={`${summary.completed} completed, ${summary.late} late, ${summary.timedIn} on duty, ${summary.missingOut} missing a time out, ${summary.absent} absent`}
        >
          <span
            className="adm-segmented-bar__part adm-segmented-bar__part--completed"
            style={{ width: `${percent(summary.completed)}%` }}
          />
          <span
            className="adm-segmented-bar__part adm-segmented-bar__part--late"
            style={{ width: `${percent(summary.late)}%` }}
          />
          <span
            className="adm-segmented-bar__part adm-segmented-bar__part--ontime"
            style={{ width: `${percent(summary.timedIn)}%` }}
          />
          <span
            className="adm-segmented-bar__part adm-segmented-bar__part--missing"
            style={{ width: `${percent(summary.missingOut)}%` }}
          />
          <span
            className="adm-segmented-bar__part adm-segmented-bar__part--absent"
            style={{ width: `${percent(summary.absent)}%` }}
          />
        </div>
        <div className="adm-legend">
          <span><i className="adm-legend__dot adm-legend__dot--completed" />{summary.completed} Completed</span>
          <span><i className="adm-legend__dot adm-legend__dot--late" />{summary.late} Late</span>
          <span><i className="adm-legend__dot adm-legend__dot--ontime" />{summary.timedIn} On duty</span>
          <span><i className="adm-legend__dot adm-legend__dot--missing" />{summary.missingOut} Missing time out</span>
          <span><i className="adm-legend__dot adm-legend__dot--absent" />{summary.absent} Absent</span>
        </div>
      </section>

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
              placeholder="Search records"
              aria-label="Search attendance records"
            />
          </label>
          <label className="adm-field adm-field--inline">
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>
          <label className="adm-field adm-field--inline">
            <span>To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => setToDate(event.target.value)}
            />
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
            <span>Year</span>
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
        </div>
      </section>

      <section className="adm-card adm-card--table">
        <div className="adm-table-head">
          <div>
            <h3>Records</h3>
            <p>{filteredRecords.length} records</p>
          </div>
          <button type="button" className="adm-btn adm-btn--secondary" onClick={exportRecords}>
            <Download size={16} aria-hidden="true" />
            Export CSV
          </button>
        </div>

        {pageRecords.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table adm-table--fit">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Group</th>
                    <th>Date</th>
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
                              <span>{record.studentId}</span>
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
                              In {formatTime(record.timeIn)} · Out {formatTime(record.timeOut)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge tone={recordStatus.tone}>{recordStatus.label}</StatusBadge>
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
                ? 'No records match these filters.'
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
