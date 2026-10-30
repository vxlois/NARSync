import { useMemo, useState } from 'react'
import {
  BarChart3,
  CalendarRange,
  Download,
  FileText,
  Flag,
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
import { dateKey, formatDateMedium } from '../../utils/format'
import { downloadCsv } from '../utils/csv'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'

export default function AdminReportsPage() {
  const { records, students, groups, schedules, currentUser } = useAdmin()
  const { toast } = useToast()
  const today = dateKey()
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
  const openFlags = filteredRecords.filter((record) => record.flag?.status === 'Open')
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
    const groupFlags = groupRecords.filter((record) => record.flag?.status === 'Open').length
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
      flags: groupFlags,
      completionRate: groupSlots ? Math.round((groupCompleted / groupSlots) * 100) : 0,
    }
  })

  const rangeValid = fromDate <= toDate
  const activeRangeLabel = rangeValid
    ? `${formatDateMedium(fromDate)} – ${formatDateMedium(toDate)}`
    : 'Invalid date range'

  const exportReport = () => {
    if (!rangeValid) {
      toast('Choose a valid date range before exporting.', 'danger')
      return
    }
    downloadCsv(
      `narsync-rle-report-${fromDate}-to-${toDate}.csv`,
      ['Group', 'Students', 'Face registered', 'Registration %', 'Schedules', 'Scheduled slots', 'Records', 'Completed', 'Late', 'Open flags', 'Completion %'],
      groupRows.map((row) => [
        row.group.name,
        row.students,
        row.registered,
        row.registrationRate,
        row.schedules,
        row.slots,
        row.records,
        row.completed,
        row.late,
        row.flags,
        row.completionRate,
      ]),
    )
    toast('RLE summary report exported as CSV.', 'success')
  }

  return (
    <div className="adm-page">
      <PageIntro
        eyebrow="Oversight reporting"
        title="Reports"
        meta={
          <>
            <span className="adm-meta-pill"><strong>{activeRangeLabel}</strong></span>
            <span className="adm-meta-pill">Prepared for <strong>{currentUser.label}</strong></span>
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
            Export report
          </button>
        }
      />

      <section className="adm-filter-card" aria-label="Report filters">
        <div className="adm-filter-card__head">
          <span>
            <CalendarRange size={15} aria-hidden="true" />
            Reporting period
          </span>
          <span className={`adm-report-range ${rangeValid ? '' : 'is-invalid'}`}>{activeRangeLabel}</span>
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
              <option value="all">All RLE groups</option>
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
          title="Choose a valid reporting period"
          description="The start date must be on or before the end date."
        />
      ) : (
        <>
          <section className="adm-stat-grid" aria-label="Report summary">
            <StatCard
              icon={Users}
              label="Scheduled attendance slots"
              value={scheduledSlots}
              note={`${filteredSchedules.length} valid duty schedules in this period`}
              tone="blue"
            />
            <StatCard
              icon={FileText}
              label="Completed attendance"
              value={completedRecords.length}
              note={`${completionRate}% completion across scheduled slots`}
              tone="green"
            />
            <StatCard
              icon={BarChart3}
              label="Late submissions"
              value={lateRecords.length}
              note={`${lateRate}% of submitted attendance records`}
              tone="amber"
            />
            <StatCard
              icon={Flag}
              label="Open verification flags"
              value={openFlags.length}
              note={`${filteredRecords.length} total records in this period`}
              tone="red"
            />
            <StatCard
              icon={ScanFace}
              label="Facial registration coverage"
              value={`${registrationRate}%`}
              note={`${registeredStudents} of ${scopedStudents.length} assigned students registered`}
              tone="violet"
            />
          </section>

          <div className="adm-dashboard-grid">
            <section className="adm-card" aria-labelledby="report-group-chart-title">
              <div className="adm-card__head">
                <div>
                  <p className="adm-eyebrow">By group</p>
                  <h3 id="report-group-chart-title">Attendance completion</h3>
                </div>
                <span className="adm-meta-pill"><strong>{completionRate}%</strong> overall</span>
              </div>
              {groupRows.length ? (
                <div className="adm-report-bars">
                  {groupRows.map((row) => (
                    <div className="adm-report-bar" key={row.group.id}>
                      <div className="adm-report-bar__head">
                        <span>
                          <strong>{row.group.name}</strong>
                          <small>{row.completed} of {row.slots} slots completed</small>
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
                  title="No group data"
                  description="No groups match the selected report filters."
                />
              )}
            </section>

            <section className="adm-card" aria-labelledby="report-registration-title">
              <div className="adm-card__head">
                <div>
                  <p className="adm-eyebrow">Registration readiness</p>
                  <h3 id="report-registration-title">Facial registration coverage</h3>
                </div>
              </div>
              {groupRows.length ? (
                <div className="adm-report-list">
                  {groupRows.map((row) => (
                    <div className="adm-report-list__row" key={row.group.id}>
                      <span>
                        <strong>{row.group.name}</strong>
                        <small>{row.registered} of {row.students} members registered</small>
                      </span>
                      <span className="adm-report-list__value">{row.registrationRate}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Users} title="No registration data" />
              )}
              <div className="adm-inline-note">
                <ScanFace size={16} aria-hidden="true" />
                <p>
                  Students register their own faces after group assignment. The report counts
                  completed registrations only.
                </p>
              </div>
            </section>
          </div>

          <section className="adm-card adm-card--table" aria-labelledby="report-table-title">
            <div className="adm-card__head">
              <div>
                <p className="adm-eyebrow">Detailed summary</p>
                <h3 id="report-table-title">Group attendance summary</h3>
              </div>
              <span className="adm-meta-pill">{activeRangeLabel}</span>
            </div>
            {groupRows.length ? (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Group</th>
                      <th>Students</th>
                      <th>Registration</th>
                      <th>Schedules</th>
                      <th>Scheduled slots</th>
                      <th>Completed</th>
                      <th>Late</th>
                      <th>Open flags</th>
                      <th>Completion rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupRows.map((row) => (
                      <tr key={row.group.id}>
                        <td>
                          <span className="adm-group-cell">
                            <strong>{row.group.name}</strong>
                          </span>
                        </td>
                        <td>{row.students}</td>
                        <td>{row.registered} / {row.students} ({row.registrationRate}%)</td>
                        <td>{row.schedules}</td>
                        <td>{row.slots}</td>
                        <td>{row.completed}</td>
                        <td>{row.late}</td>
                        <td>{row.flags}</td>
                        <td><strong>{row.completionRate}%</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No report data" description="Adjust the reporting period or group filter." />
            )}
          </section>

          <div className="adm-inline-note">
            <FileText size={16} aria-hidden="true" />
            <p>
              This report is generated from the prototype’s fictional attendance, schedule, and
              registration data. No exported file is sent to a server.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
