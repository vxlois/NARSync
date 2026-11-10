import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarRange,
  Clock3,
  Download,
  FileText,
  RotateCcw,
  ScanFace,
  Users,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import {
  getGroupStats,
  getRecordStatus,
  getScheduleStatus,
  shiftDate,
} from '../adminData'
import { useToast } from '../../context/ToastContext'
import { dateKey, formatDateMedium, formatTimestamp } from '../../utils/format'
import { downloadCsvRows } from '../utils/csv'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'

const PERIOD_OPTIONS = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'month', label: 'This month' },
]

export default function AdminReportsPage() {
  const { records, students, groups, schedules, currentUser } = useAdmin()
  const { toast } = useToast()
  const navigate = useNavigate()
  const today = dateKey()
  const monthStart = `${today.slice(0, 7)}-01`
  const [fromDate, setFromDate] = useState(shiftDate(today, -6))
  const [toDate, setToDate] = useState(today)
  const [groupId, setGroupId] = useState('all')

  const scopedGroups = groups.filter((group) => groupId === 'all' || group.id === groupId)
  const scopedGroupIds = new Set(scopedGroups.map((group) => group.id))
  const scopedStudents = students.filter(
    (student) => student.groupId && scopedGroupIds.has(student.groupId),
  )

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          record.date >= fromDate &&
          record.date <= toDate &&
          (groupId === 'all' || record.groupId === groupId),
      ),
    [records, fromDate, toDate, groupId],
  )

  const filteredSchedules = useMemo(
    () =>
      schedules.filter(
        (schedule) =>
          schedule.date >= fromDate &&
          schedule.date <= toDate &&
          (groupId === 'all' || schedule.groupId === groupId) &&
          ['ready', 'completed'].includes(getScheduleStatus(schedule).key),
      ),
    [schedules, fromDate, toDate, groupId],
  )

  const scheduledSlots = filteredSchedules.reduce((total, schedule) => {
    const group = groups.find((item) => item.id === schedule.groupId)
    return total + (group?.memberIds.length || 0)
  }, 0)

  const completedRecords = filteredRecords.filter((record) => record.timeIn && record.timeOut)
  const lateRecords = filteredRecords.filter((record) => getRecordStatus(record).key === 'late')
  const missingOutRecords = filteredRecords.filter(
    (record) => getRecordStatus(record).key === 'missing-out',
  )
  const registeredStudents = scopedStudents.filter((student) => student.faceRegistered).length
  const completionRate = scheduledSlots
    ? Math.round((completedRecords.length / scheduledSlots) * 100)
    : 0
  const lateRate = filteredRecords.length
    ? Math.round((lateRecords.length / filteredRecords.length) * 100)
    : 0
  const registrationRate = scopedStudents.length
    ? Math.round((registeredStudents / scopedStudents.length) * 100)
    : 0

  const groupRows = scopedGroups.map((group) => {
    const groupStudents = students.filter((student) => student.groupId === group.id)
    const groupStats = getGroupStats(group, students)
    const groupSchedules = filteredSchedules.filter((schedule) => schedule.groupId === group.id)
    const groupSlots = groupSchedules.reduce((total, schedule) => {
      const scheduleGroup = groups.find((item) => item.id === schedule.groupId)
      return total + (scheduleGroup?.memberIds.length || 0)
    }, 0)
    const groupRecords = filteredRecords.filter((record) => record.groupId === group.id)
    const groupCompleted = groupRecords.filter((record) => record.timeIn && record.timeOut).length
    const groupLate = groupRecords.filter((record) => getRecordStatus(record).key === 'late').length
    const groupMissingOut = groupRecords.filter(
      (record) => getRecordStatus(record).key === 'missing-out',
    ).length
    return {
      group,
      students: groupStudents.length,
      registered: groupStats.registered,
      registrationRate: groupStats.percent,
      schedules: groupSchedules.length,
      slots: groupSlots,
      records: groupRecords.length,
      completed: groupCompleted,
      late: groupLate,
      missingOut: groupMissingOut,
      completionRate: groupSlots ? Math.round((groupCompleted / groupSlots) * 100) : 0,
    }
  })

  const reportTotals = groupRows.reduce(
    (totals, row) => ({
      students: totals.students + row.students,
      registered: totals.registered + row.registered,
      schedules: totals.schedules + row.schedules,
      slots: totals.slots + row.slots,
      completed: totals.completed + row.completed,
      late: totals.late + row.late,
      missingOut: totals.missingOut + row.missingOut,
    }),
    { students: 0, registered: 0, schedules: 0, slots: 0, completed: 0, late: 0, missingOut: 0 },
  )
  const totalRegistrationRate = reportTotals.students
    ? Math.round((reportTotals.registered / reportTotals.students) * 100)
    : 0
  const totalCompletionRate = reportTotals.slots
    ? Math.round((reportTotals.completed / reportTotals.slots) * 100)
    : 0

  const rangeValid = fromDate <= toDate
  const activeRangeLabel = rangeValid
    ? `${formatDateMedium(fromDate)} – ${formatDateMedium(toDate)}`
    : 'Invalid date range'

  const applyPeriod = (key) => {
    if (key === '7d') {
      setFromDate(shiftDate(today, -6))
      setToDate(today)
    } else if (key === '30d') {
      setFromDate(shiftDate(today, -29))
      setToDate(today)
    } else {
      setFromDate(monthStart)
      setToDate(today)
    }
  }

  const activePeriod =
    fromDate === shiftDate(today, -6) && toDate === today
      ? '7d'
      : fromDate === shiftDate(today, -29) && toDate === today
        ? '30d'
        : fromDate === monthStart && toDate === today
          ? 'month'
          : ''

  const resetFilters = () => {
    setFromDate(shiftDate(today, -6))
    setToDate(today)
    setGroupId('all')
  }

  const exportReport = () => {
    if (!rangeValid) {
      toast('Choose a valid date range.', 'danger')
      return
    }
    const scopeLabel =
      groupId === 'all' ? 'All groups' : groups.find((group) => group.id === groupId)?.name || '—'
    downloadCsvRows(`narsync-report-${fromDate}-to-${toDate}.csv`, [
      ['NARSync RLE Attendance Report'],
      ['Period', activeRangeLabel],
      ['Group', scopeLabel],
      ['Prepared by', currentUser.label],
      ['Generated', formatTimestamp(new Date().toISOString())],
      [],
      ['Summary'],
      ['Scheduled slots', scheduledSlots],
      ['Completed', completedRecords.length],
      ['Late', lateRecords.length],
      ['Missing time out', missingOutRecords.length],
      ['Completion rate', `${completionRate}%`],
      ['Face registration', `${registeredStudents} of ${scopedStudents.length} (${registrationRate}%)`],
      [],
      ['Group summary'],
      [
        'Group',
        'Students',
        'Registered',
        'Registration %',
        'Schedules',
        'Scheduled slots',
        'Completed',
        'Late',
        'Missing time out',
        'Completion %',
      ],
      ...groupRows.map((row) => [
        row.group.name,
        row.students,
        row.registered,
        row.registrationRate,
        row.schedules,
        row.slots,
        row.completed,
        row.late,
        row.missingOut,
        row.completionRate,
      ]),
      [
        'Total',
        reportTotals.students,
        reportTotals.registered,
        totalRegistrationRate,
        reportTotals.schedules,
        reportTotals.slots,
        reportTotals.completed,
        reportTotals.late,
        reportTotals.missingOut,
        totalCompletionRate,
      ],
    ])
    toast('Report exported.', 'success')
  }

  return (
    <div className="adm-page">
      <PageIntro
        meta={
          <>
            {PERIOD_OPTIONS.map((period) => (
              <button
                key={period.key}
                type="button"
                className={`adm-quick-filter ${activePeriod === period.key ? 'is-active' : ''}`}
                onClick={() => applyPeriod(period.key)}
                aria-pressed={activePeriod === period.key}
              >
                {period.label}
              </button>
            ))}
          </>
        }
        actions={
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={exportReport}
            disabled={!rangeValid}
          >
            <Download size={16} aria-hidden="true" />
            Export CSV
          </button>
        }
      />

      <section className="adm-filter-card" aria-label="Report filters">
        <div className="adm-filter-card__head">
          <span>
            <CalendarRange size={15} aria-hidden="true" />
            Filters
          </span>
          <button type="button" className="adm-text-btn" onClick={resetFilters}>
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
        </div>
        <div className="adm-filters">
          <label className="adm-field adm-field--inline">
            <span>From</span>
            <input type="date" value={fromDate} max={toDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>
          <label className="adm-field adm-field--inline">
            <span>To</span>
            <input type="date" value={toDate} min={fromDate} onChange={(event) => setToDate(event.target.value)} />
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
        </div>
      </section>

      {!rangeValid ? (
        <EmptyState
          icon={CalendarRange}
          title="Invalid date range"
          description="The start date must be on or before the end date."
        />
      ) : (
        <>
          <section className="adm-stat-grid" aria-label="Report summary">
            <StatCard
              icon={Users}
              label="Scheduled slots"
              value={scheduledSlots}
              note={`${filteredSchedules.length} schedules`}
              tone="blue"
            />
            <StatCard
              icon={FileText}
              label="Completed"
              value={completedRecords.length}
              note={`${completionRate}% completion`}
              tone="green"
            />
            <StatCard
              icon={BarChart3}
              label="Late"
              value={lateRecords.length}
              note={`${lateRate}% of records`}
              tone="amber"
            />
            <StatCard
              icon={Clock3}
              label="Missing time out"
              value={missingOutRecords.length}
              note={`${filteredRecords.length} records`}
              tone="red"
            />
            <StatCard
              icon={ScanFace}
              label="Face registration"
              value={`${registrationRate}%`}
              note={`${registeredStudents} of ${scopedStudents.length} students`}
              tone="violet"
            />
          </section>

          <div className="adm-dashboard-grid">
            <section className="adm-card" aria-labelledby="report-group-chart-title">
              <div className="adm-card__head">
                <div>
                  <h3 id="report-group-chart-title">Completion by group</h3>
                </div>
                <span className="adm-meta-pill"><strong>{completionRate}%</strong></span>
              </div>
              {groupRows.length ? (
                <div className="adm-report-bars">
                  {groupRows.map((row) => (
                    <div className="adm-report-bar" key={row.group.id}>
                      <div className="adm-report-bar__head">
                        <span>
                          <strong>{row.group.name}</strong>
                          <small>{row.completed}/{row.slots} slots</small>
                        </span>
                        <strong>{row.completionRate}%</strong>
                      </div>
                      <ProgressBar
                        value={row.completionRate}
                        hideLabel
                        tone={row.completionRate >= 75 ? 'success' : row.completionRate >= 50 ? 'warning' : 'danger'}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="No groups"
                  description="No groups match these filters."
                />
              )}
            </section>

            <section className="adm-card" aria-labelledby="report-registration-title">
              <div className="adm-card__head">
                <div>
                  <h3 id="report-registration-title">Face registration</h3>
                </div>
              </div>
              {groupRows.length ? (
                <div className="adm-report-list">
                  {groupRows.map((row) => (
                    <div className="adm-report-list__row" key={row.group.id}>
                      <span>
                        <strong>{row.group.name}</strong>
                        <small>{row.registered}/{row.students} registered</small>
                      </span>
                      <span className="adm-report-list__value">{row.registrationRate}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Users} title="No data" />
              )}
            </section>
          </div>

          <section className="adm-card adm-card--table" aria-labelledby="report-table-title">
            <div className="adm-table-head">
              <div>
                <h3 id="report-table-title">Groups</h3>
                <p>{groupRows.length} groups</p>
              </div>
            </div>
            {groupRows.length ? (
              <div className="adm-table-wrap">
                <table className="adm-table adm-table--fit">
                  <thead>
                    <tr>
                      <th>Group</th>
                      <th>Students</th>
                      <th>Schedules</th>
                      <th>Completed</th>
                      <th>Late</th>
                      <th>Missing out</th>
                      <th>Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupRows.map((row) => (
                      <tr
                        key={row.group.id}
                        className="adm-table__row--clickable"
                        onClick={() => navigate(`/admin/groups/${row.group.id}`)}
                      >
                        <td><strong>{row.group.name}</strong></td>
                        <td>
                          <div className="adm-cell-stack">
                            <strong>{row.students}</strong>
                            <span className="adm-cell-sub">
                              {row.registered} registered · {row.registrationRate}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="adm-cell-stack">
                            <strong>{row.schedules}</strong>
                            <span className="adm-cell-sub">{row.slots} slots</span>
                          </div>
                        </td>
                        <td>{row.completed}</td>
                        <td>{row.late}</td>
                        <td>{row.missingOut}</td>
                        <td><strong>{row.completionRate}%</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No data" description="Adjust the filters." />
            )}
          </section>
        </>
      )}
    </div>
  )
}
