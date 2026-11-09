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
  UserCheck,
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
const MISSING_LIMIT = 6

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

  const scheduledIds = useMemo(
    () => getScheduledStudentsForDate({ schedules, students, date, groupId, yearLevel, locationId }),
    [schedules, students, date, groupId, yearLevel, locationId],
  )

  const matchesFilters = (record, recordDate) => {
    const student = studentById[record.studentId]
    if (record.date !== recordDate || !student) return false
    if (groupId !== 'all' && student.groupId !== groupId) return false
    if (yearLevel !== 'all' && student.yearLevel !== yearLevel) return false
    if (locationId !== 'all' && record.locationId !== locationId) return false
    return true
  }

  const filteredRecords = useMemo(
    () => records.filter((record) => matchesFilters(record, date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, date, groupId, yearLevel, locationId, studentById],
  )

  const timedInRecords = filteredRecords.filter((record) => record.timeIn)
  const completedRecords = filteredRecords.filter((record) => record.timeIn && record.timeOut)
  const flaggedRecords = filteredRecords
    .filter((record) => record.flag?.status === 'Open')
    .sort((a, b) => (a.flag.raisedAt < b.flag.raisedAt ? 1 : -1))
  const onDuty = Math.max(0, timedInRecords.length - completedRecords.length)

  const missingStudents = useMemo(() => {
    const timedIn = new Set(timedInRecords.map((record) => record.studentId))
    return [...scheduledIds]
      .filter((id) => !timedIn.has(id))
      .map((id) => studentById[id])
      .filter(Boolean)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledIds, filteredRecords, studentById])

  const total = scheduledIds.size
  const percent = (value) => (total ? (value / total) * 100 : 0)
  const completionRate = Math.round(percent(completedRecords.length))

  const trend = useMemo(() => {
    const days = []
    for (let offset = -6; offset <= 0; offset += 1) {
      const trendDate = shiftDate(date, offset)
      const scheduled = getScheduledStudentsForDate({
        schedules, students, date: trendDate, groupId, yearLevel, locationId,
      })
      const completed = new Set(
        records
          .filter((record) => matchesFilters(record, trendDate) && record.timeIn && record.timeOut)
          .map((record) => record.studentId),
      ).size
      days.push({
        date: trendDate,
        label: DATE_LABELS[new Date(`${trendDate}T12:00:00`).getDay()],
        percent: scheduled.size ? Math.round((completed / scheduled.size) * 100) : 0,
        isSelected: trendDate === date,
      })
    }
    return days
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, groupId, yearLevel, locationId, schedules, students, records, studentById])

  const recentSubmissions = [...filteredRecords]
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
    .slice(0, 5)

  const buildQuery = (params) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') search.set(key, value)
    })
    const query = search.toString()
    return query ? `?${query}` : ''
  }

  const filters = { date, group: groupId, year: yearLevel, location: locationId }
  const schedulesHref = `/admin/schedules${buildQuery({ date, group: groupId, location: locationId })}`
  const attendanceHref = `/admin/attendance${buildQuery(filters)}`
  const flaggedHref = `/admin/flagged${buildQuery({ date, status: 'Open', group: groupId })}`

  const isFiltered = groupId !== 'all' || yearLevel !== 'all' || locationId !== 'all' || date !== dateKey()
  const resetFilters = () => {
    setDate(dateKey())
    setGroupId('all')
    setYearLevel('all')
    setLocationId('all')
  }

  return (
    <div className="adm-page">
      <PageIntro
        title={date === dateKey() ? 'Today' : formatDateLong(date)}
        actions={
          <>
            <Link to={flaggedHref} className="adm-btn adm-btn--secondary">
              <Flag size={16} aria-hidden="true" />
              Flags
              {flaggedRecords.length > 0 && <span className="adm-btn__count">{flaggedRecords.length}</span>}
            </Link>
            <Link to="/admin/reports" className="adm-btn adm-btn--primary">
              Reports
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </>
        }
      />

      <div className="adm-toolbar" role="group" aria-label="Dashboard filters">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        <select value={groupId} onChange={(e) => setGroupId(e.target.value)} aria-label="Group">
          <option value="all">All groups</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} aria-label="Year level">
          <option value="all">All years</option>
          {YEAR_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        <select value={locationId} onChange={(e) => setLocationId(e.target.value)} aria-label="Location">
          <option value="all">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>{location.name}</option>
          ))}
        </select>
        {isFiltered && (
          <button type="button" className="adm-text-btn" onClick={resetFilters}>
            <RotateCcw size={14} aria-hidden="true" /> Reset
          </button>
        )}
      </div>

      <section className="adm-stat-grid adm-stat-grid--4" aria-label="Summary">
        <StatCard
          icon={CalendarDays}
          label="Scheduled"
          value={total}
          tone="blue"
          to={schedulesHref}
          hint="Open duty schedules"
        />
        <StatCard
          icon={LogIn}
          label="Timed in"
          value={timedInRecords.length}
          note={`of ${total}`}
          tone="teal"
          to={`/admin/attendance${buildQuery({ ...filters, view: 'timed-in' })}`}
          hint="Open timed-in records"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Completed"
          value={completedRecords.length}
          note={`${completionRate}%`}
          tone="green"
          to={`/admin/attendance${buildQuery({ ...filters, view: 'completed' })}`}
          hint="Open completed records"
        />
        <StatCard
          icon={Flag}
          label="Flagged"
          value={flaggedRecords.length}
          tone="red"
          to={flaggedHref}
          hint="Open flagged records"
        />
      </section>

      <section className="adm-card adm-progress-hero" aria-label="Attendance progress">
        <div className="adm-progress-hero__top">
          <strong>{completionRate}%</strong>
          <span>complete</span>
          <Link to={attendanceHref} className="adm-text-link">
            All records <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div
          className="adm-segmented-bar"
          role="img"
          aria-label={`${completedRecords.length} completed, ${onDuty} on duty, ${missingStudents.length} not timed in`}
        >
          <span className="adm-segmented-bar__part adm-segmented-bar__part--completed" style={{ width: `${percent(completedRecords.length)}%` }} />
          <span className="adm-segmented-bar__part adm-segmented-bar__part--ontime" style={{ width: `${percent(onDuty)}%` }} />
          <span className="adm-segmented-bar__part adm-segmented-bar__part--missing" style={{ width: `${percent(missingStudents.length)}%` }} />
        </div>
        <div className="adm-legend">
          <span><i className="adm-legend__dot adm-legend__dot--completed" />{completedRecords.length} Completed</span>
          <span><i className="adm-legend__dot adm-legend__dot--ontime" />{onDuty} On duty</span>
          <span><i className="adm-legend__dot adm-legend__dot--missing" />{missingStudents.length} Not timed in</span>
        </div>
      </section>

      <div className="adm-dashboard-grid adm-dashboard-grid--even">
        <section className="adm-card" aria-labelledby="missing-title">
          <div className="adm-card__head">
            <h3 id="missing-title">Not timed in</h3>
            <span className="adm-meta-pill"><strong>{missingStudents.length}</strong></span>
          </div>
          {missingStudents.length ? (
            <div className="adm-recent-list">
              {missingStudents.slice(0, MISSING_LIMIT).map((student) => (
                <div className="adm-recent-row" key={student.id}>
                  <Avatar name={student.name} size="sm" />
                  <span className="adm-recent-row__main">
                    <strong>{student.name}</strong>
                    <span>{getGroupById(groups, student.groupId)?.name}</span>
                  </span>
                </div>
              ))}
              {missingStudents.length > MISSING_LIMIT && (
                <p className="adm-more">+{missingStudents.length - MISSING_LIMIT} more</p>
              )}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} title="Everyone is timed in" />
          )}
        </section>

        <section className="adm-card" aria-labelledby="flags-title">
          <div className="adm-card__head">
            <h3 id="flags-title">Flags to review</h3>
            <Link to={flaggedHref} className="adm-text-link">
              All <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {flaggedRecords.length ? (
            <div className="adm-flag-list">
              {flaggedRecords.slice(0, 5).map((record) => (
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
                    <strong>{getStudentById(students, record.studentId)?.name}</strong>
                    <span>{record.flag.reason}</span>
                  </span>
                  <span className="adm-text-btn">Review</span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} title="No open flags" />
          )}
        </section>
      </div>

      <div className="adm-dashboard-grid adm-dashboard-grid--even">
        <section className="adm-card" aria-labelledby="recent-title">
          <div className="adm-card__head">
            <h3 id="recent-title">Latest</h3>
            <Link to={attendanceHref} className="adm-text-link">
              All <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {recentSubmissions.length ? (
            <div className="adm-recent-list">
              {recentSubmissions.map((record) => {
                const student = getStudentById(students, record.studentId)
                const status = getRecordStatus(record)
                return (
                  <button
                    type="button"
                    className="adm-recent-row"
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <Avatar name={student?.name || 'Unknown'} size="sm" />
                    <span className="adm-recent-row__main">
                      <strong>{student?.name}</strong>
                      <span>{getLocationById(locations, record.locationId)?.name}</span>
                    </span>
                    <span className="adm-recent-row__times">
                      <span>{formatTime(record.timeIn)}</span>
                      <small>{formatTime(record.timeOut)}</small>
                    </span>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </button>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={UserCheck} title="No submissions yet" />
          )}
        </section>

        <section className="adm-card" aria-labelledby="trend-title">
          <div className="adm-card__head">
            <h3 id="trend-title">Last 7 days</h3>
          </div>
          <div className="adm-trend-chart" role="img" aria-label="Completion over the last seven days">
            {trend.map((day) => (
              <div className={`adm-trend-bar ${day.isSelected ? 'is-selected' : ''}`} key={day.date}>
                <span className="adm-trend-bar__value">{day.percent}%</span>
                <div className="adm-trend-bar__track">
                  <span className="adm-trend-bar__fill" style={{ height: `${Math.max(day.percent, 4)}%` }} />
                </div>
                <span className="adm-trend-bar__label">{day.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Drawer
        open={Boolean(selectedRecord)}
        title="Attendance record"
        subtitle={
          selectedRecord ? getStudentById(students, selectedRecord.studentId)?.name : ''
        }
        onClose={() => setSelectedRecord(null)}
      >
        {selectedRecord && <RecordDetailPanel record={selectedRecord} />}
      </Drawer>
    </div>
  )
}