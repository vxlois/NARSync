import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  LogIn,
  RotateCcw,
  SlidersHorizontal,
  UserCheck,
  Users,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import {
  getGroupById,
  getLocationById,
  getRecordStatus,
  getScheduledStudentsForDate,
  getStudentById,
  shiftDate,
  YEAR_LEVELS,
} from '../adminData'
import { dateKey, formatDateLong, formatTime } from '../../utils/format'
import Avatar from '../components/Avatar'
import Drawer from '../components/Drawer'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import RecordDetailPanel from '../components/RecordDetailPanel'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'

const DATE_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AdminDashboardPage() {
  const { students, groups, schedules, locations, records } = useAdmin()
  const [date, setDate] = useState(dateKey())
  const [groupId, setGroupId] = useState('all')
  const [yearLevel, setYearLevel] = useState('all')
  const [locationId, setLocationId] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState(null)

  const studentById = useMemo(
    () => Object.fromEntries(students.map((student) => [student.id, student])),
    [students],
  )

  const scopedStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          (groupId === 'all' || student.groupId === groupId) &&
          (yearLevel === 'all' || student.yearLevel === yearLevel),
      ),
    [students, groupId, yearLevel],
  )

  const scheduledIds = useMemo(
    () =>
      getScheduledStudentsForDate({
        schedules,
        students,
        date,
        groupId,
        yearLevel,
        locationId,
      }),
    [schedules, students, date, groupId, yearLevel, locationId],
  )

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const student = studentById[record.studentId]
        if (record.date !== date) return false
        if (!student) return false
        if (groupId !== 'all' && student.groupId !== groupId) return false
        if (yearLevel !== 'all' && student.yearLevel !== yearLevel) return false
        if (locationId !== 'all' && record.locationId !== locationId) return false
        return true
      }),
    [records, date, groupId, yearLevel, locationId, studentById],
  )

  const timedInRecords = filteredRecords.filter((record) => record.timeIn)
  const completedRecords = filteredRecords.filter((record) => record.timeIn && record.timeOut)
  const flaggedRecords = filteredRecords.filter((record) => record.flag?.status === 'Open')
  const onDuty = Math.max(0, timedInRecords.length - completedRecords.length)
  const notTimedIn = Math.max(0, scheduledIds.size - timedInRecords.length)
  const completionRate = scheduledIds.size
    ? Math.round((completedRecords.length / scheduledIds.size) * 100)
    : 0

  const daySchedules = schedules.filter((schedule) => {
    if (schedule.date !== date) return false
    if (groupId !== 'all' && schedule.groupId !== groupId) return false
    if (locationId !== 'all' && schedule.locationId !== locationId) return false
    return true
  })

  const trend = useMemo(() => {
    const days = []
    for (let offset = -6; offset <= 0; offset += 1) {
      const trendDate = shiftDate(date, offset)
      const trendScheduled = getScheduledStudentsForDate({
        schedules,
        students,
        date: trendDate,
        groupId,
        yearLevel,
        locationId,
      })
      const trendRecords = records.filter((record) => {
        const student = studentById[record.studentId]
        if (record.date !== trendDate) return false
        if (!student) return false
        if (groupId !== 'all' && student.groupId !== groupId) return false
        if (yearLevel !== 'all' && student.yearLevel !== yearLevel) return false
        if (locationId !== 'all' && record.locationId !== locationId) return false
        return true
      })
      const completed = new Set(
        trendRecords
          .filter((record) => record.timeIn && record.timeOut)
          .map((record) => record.studentId),
      ).size
      days.push({
        date: trendDate,
        label: DATE_LABELS[new Date(`${trendDate}T12:00:00`).getDay()],
        percent: trendScheduled.size ? Math.round((completed / trendScheduled.size) * 100) : 0,
        completed,
        scheduled: trendScheduled.size,
        isSelected: trendDate === date,
      })
    }
    const average = Math.round(days.reduce((total, day) => total + day.percent, 0) / days.length)
    return { days, average }
  }, [date, groupId, yearLevel, locationId, schedules, students, records, studentById])

  const recentSubmissions = [...filteredRecords]
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
    .slice(0, 5)
  const recentFlags = [...filteredRecords]
    .filter((record) => record.flag)
    .sort((a, b) => (a.flag.raisedAt < b.flag.raisedAt ? 1 : -1))
    .slice(0, 4)

  const resetFilters = () => {
    setDate(dateKey())
    setGroupId('all')
    setYearLevel('all')
    setLocationId('all')
  }

  // Builds a query string only from filters that are actively applied, so a
  // drill-down never sends empty defaults to the destination page.
  const buildQuery = (params) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') search.set(key, value)
    })
    const query = search.toString()
    return query ? `?${query}` : ''
  }

  const studentsHref = `/admin/students${buildQuery({ group: groupId, year: yearLevel })}`
  const schedulesHref = `/admin/schedules${buildQuery({ date, group: groupId, location: locationId })}`
  const attendanceHref = `/admin/attendance${buildQuery({
    date,
    group: groupId,
    year: yearLevel,
    location: locationId,
  })}`
  const flaggedHref = `/admin/flagged${buildQuery({ date, status: 'Open', group: groupId })}`

  const activeFilterCount = [
    groupId !== 'all',
    yearLevel !== 'all',
    locationId !== 'all',
    date !== dateKey(),
  ].filter(Boolean).length

  return (
    <div className="adm-page">
      <PageIntro
        eyebrow="Attendance command center"
        title="Attendance at a glance"
        actions={
          <>
            <Link to={flaggedHref} className="adm-btn adm-btn--secondary">
              <Flag size={16} aria-hidden="true" />
              Review flags
              {flaggedRecords.length > 0 && <span className="adm-btn__count">{flaggedRecords.length}</span>}
            </Link>
            <Link to="/admin/reports" className="adm-btn adm-btn--primary">
              Open reports
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </>
        }
      />

      <section className="adm-filter-card" aria-label="Dashboard filters">
        <div className="adm-filter-card__head">
          <span>
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && <span className="adm-filter-count">{activeFilterCount} active</span>}
          </span>
          <button type="button" className="adm-text-btn" onClick={resetFilters}>
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
        </div>
        <div className="adm-filters">
          <label className="adm-field adm-field--inline">
            <span>Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
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
            <span>Year level</span>
            <select value={yearLevel} onChange={(event) => setYearLevel(event.target.value)}>
              <option value="all">All year levels</option>
              {YEAR_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Clinical location</span>
            <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
              <option value="all">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="adm-stat-grid" aria-label="Attendance summary">
        <StatCard
          icon={Users}
          label="Total registered students"
          value={scopedStudents.length}
          note={`${groups.filter((group) => group.status === 'Active').length} active RLE groups`}
          tone="violet"
          to={studentsHref}
          hint="Open the student roster with the current group and year level filters"
        />
        <StatCard
          icon={CalendarDays}
          label="Students scheduled for duty"
          value={scheduledIds.size}
          note={`${daySchedules.length} duty ${daySchedules.length === 1 ? 'schedule' : 'schedules'} on ${formatDateLong(date)}`}
          tone="blue"
          to={schedulesHref}
          hint={`Open duty schedules for ${formatDateLong(date)}`}
        />
        <StatCard
          icon={LogIn}
          label="Students timed in"
          value={timedInRecords.length}
          note={
            scheduledIds.size
              ? `${Math.round((timedInRecords.length / scheduledIds.size) * 100)}% of scheduled students`
              : 'No scheduled students for this selection'
          }
          tone="teal"
          to={`/admin/attendance${buildQuery({
            date,
            group: groupId,
            year: yearLevel,
            location: locationId,
            view: 'timed-in',
          })}`}
          hint={`Open students timed in on ${formatDateLong(date)}`}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Completed attendance"
          value={completedRecords.length}
          note={`${completionRate}% completion rate for the selected date`}
          tone="green"
          to={`/admin/attendance${buildQuery({
            date,
            group: groupId,
            year: yearLevel,
            location: locationId,
            view: 'completed',
          })}`}
          hint={`Open completed attendance records for ${formatDateLong(date)}`}
        />
        <StatCard
          icon={Flag}
          label="Records flagged for review"
          value={flaggedRecords.length}
          note={flaggedRecords.length ? 'Coordinator action required' : 'No open flags for this selection'}
          tone="red"
          to={flaggedHref}
          hint={`Open flagged records for ${formatDateLong(date)}`}
        />
      </section>

      <div className="adm-dashboard-grid">
        <section className="adm-card adm-attendance-summary" aria-labelledby="day-summary-title">
          <div className="adm-card__head">
            <div>
              <p className="adm-eyebrow">Selected date</p>
              <h3 id="day-summary-title">{formatDateLong(date)}</h3>
            </div>
            <StatusBadge tone={completionRate >= 75 ? 'success' : completionRate >= 50 ? 'warning' : 'neutral'} dot>
              {completionRate}% complete
            </StatusBadge>
          </div>

          <div className="adm-attendance-summary__numbers">
            <div>
              <strong>{completedRecords.length}</strong>
              <span>Completed</span>
            </div>
            <div>
              <strong>{onDuty}</strong>
              <span>On duty</span>
            </div>
            <div>
              <strong>{notTimedIn}</strong>
              <span>Not timed in</span>
            </div>
            <div>
              <strong>{flaggedRecords.length}</strong>
              <span>Flagged</span>
            </div>
          </div>

          <div
            className="adm-segmented-bar"
            role="img"
            aria-label={`${completedRecords.length} completed, ${onDuty} on duty, ${notTimedIn} not timed in`}
          >
            <span
              className="adm-segmented-bar__part adm-segmented-bar__part--completed"
              style={{ width: `${scheduledIds.size ? (completedRecords.length / scheduledIds.size) * 100 : 0}%` }}
            />
            <span
              className="adm-segmented-bar__part adm-segmented-bar__part--ontime"
              style={{ width: `${scheduledIds.size ? (onDuty / scheduledIds.size) * 100 : 0}%` }}
            />
            <span
              className="adm-segmented-bar__part adm-segmented-bar__part--missing"
              style={{ width: `${scheduledIds.size ? (notTimedIn / scheduledIds.size) * 100 : 0}%` }}
            />
          </div>

          <div className="adm-legend">
            <span><i className="adm-legend__dot adm-legend__dot--completed" />Completed</span>
            <span><i className="adm-legend__dot adm-legend__dot--ontime" />On duty</span>
            <span><i className="adm-legend__dot adm-legend__dot--missing" />Not timed in</span>
          </div>

          <div className="adm-attendance-summary__foot">
            <p>
              {scheduledIds.size
                ? `${completedRecords.length} of ${scheduledIds.size} scheduled students have a time in and time out.`
                : 'No valid duty schedules match the current filters.'}
            </p>
            <Link to={attendanceHref} className="adm-text-link">
              Open attendance records <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="adm-card adm-trend-card" aria-labelledby="trend-title">
          <div className="adm-card__head">
            <div>
              <p className="adm-eyebrow">7-day view</p>
              <h3 id="trend-title">Attendance trend</h3>
            </div>
            <div className="adm-trend-card__average">
              <strong>{trend.average}%</strong>
              <span>avg. completion</span>
            </div>
          </div>

          <div className="adm-trend-chart" role="img" aria-label={`Average completion ${trend.average}% over the last seven days`}>
            {trend.days.map((day) => (
              <div className={`adm-trend-bar ${day.isSelected ? 'is-selected' : ''}`} key={day.date}>
                <span className="adm-trend-bar__value">{day.percent}%</span>
                <div className="adm-trend-bar__track">
                  <span
                    className="adm-trend-bar__fill"
                    style={{ height: `${Math.max(day.percent, 4)}%` }}
                    title={`${day.completed} of ${day.scheduled} completed`}
                  />
                </div>
                <span className="adm-trend-bar__label">{day.label}</span>
              </div>
            ))}
          </div>
          <p className="adm-trend-note">
            Completion means both a time in and a time out were recorded for a scheduled student.
          </p>
        </section>
      </div>

      <div className="adm-dashboard-lower">
        <section className="adm-card" aria-labelledby="recent-submissions-title">
          <div className="adm-card__head">
            <div>
              <p className="adm-eyebrow">Latest activity</p>
              <h3 id="recent-submissions-title">Recent attendance submissions</h3>
            </div>
            <Link to={attendanceHref} className="adm-text-link">
              View all <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {recentSubmissions.length ? (
            <div className="adm-recent-list">
              {recentSubmissions.map((record) => {
                const student = getStudentById(students, record.studentId)
                const group = getGroupById(groups, record.groupId)
                const location = getLocationById(locations, record.locationId)
                const status = getRecordStatus(record)
                return (
                  <button
                    type="button"
                    className="adm-recent-row"
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <Avatar name={student?.name || 'Unknown student'} size="sm" />
                    <span className="adm-recent-row__main">
                      <strong>{student?.name}</strong>
                      <span>
                        {group?.name} · {location?.name}
                      </span>
                    </span>
                    <span className="adm-recent-row__times">
                      <span>In {formatTime(record.timeIn)}</span>
                      <small>Out {formatTime(record.timeOut)}</small>
                    </span>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </button>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={UserCheck}
              title="No submissions for this selection"
              description="Try another date, group, year level, or clinical location."
            />
          )}
        </section>

        <section className="adm-card" aria-labelledby="recent-flags-title">
          <div className="adm-card__head">
            <div>
              <p className="adm-eyebrow">Needs attention</p>
              <h3 id="recent-flags-title">Recent flagged records</h3>
            </div>
            <Link to={flaggedHref} className="adm-text-link">
              Review all <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {recentFlags.length ? (
            <div className="adm-flag-list">
              {recentFlags.map((record) => {
                const student = getStudentById(students, record.studentId)
                return (
                  <button
                    type="button"
                    className="adm-flag-row"
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <span className="adm-flag-row__icon" aria-hidden="true">
                      <AlertTriangle size={16} />
                    </span>
                    <span className="adm-flag-row__copy">
                      <strong>{record.flag.reason}</strong>
                      <span>{student?.name} · {formatTime(record.flag.raisedAt)}</span>
                    </span>
                    <StatusBadge tone={record.flag.status === 'Open' ? 'danger' : 'success'}>
                      {record.flag.status}
                    </StatusBadge>
                  </button>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No flagged records"
              description="Flags raised by facial verification or geofence checks will appear here."
            />
          )}

          <div className="adm-flag-summary">
            <div>
              <span>Open</span>
              <strong>{flaggedRecords.length}</strong>
            </div>
            <div>
              <span>Resolved today</span>
              <strong>{filteredRecords.filter((record) => record.flag?.status === 'Resolved').length}</strong>
            </div>
          </div>
        </section>
      </div>

      <Drawer
        open={Boolean(selectedRecord)}
        title="Attendance record"
        subtitle={
          selectedRecord
            ? `${getStudentById(students, selectedRecord.studentId)?.name || 'Student'} · ${formatDateLong(selectedRecord.date)}`
            : ''
        }
        onClose={() => setSelectedRecord(null)}
      >
        {selectedRecord && <RecordDetailPanel record={selectedRecord} />}
      </Drawer>
    </div>
  )
}
