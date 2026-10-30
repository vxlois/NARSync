import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Pencil,
  ScanFace,
  UserPlus,
  Users,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import {
  getGroupById,
  getGroupStats,
  getLocationById,
  getRecordStatus,
  getScheduleStatus,
  INSTRUCTORS,
  YEAR_LEVELS,
} from '../adminData'
import { useToast } from '../../context/ToastContext'
import { dateKey, formatDateMedium, formatTime } from '../../utils/format'
import Avatar from '../components/Avatar'
import Drawer from '../components/Drawer'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import StudentSelector from '../components/StudentSelector'
import ViewOnlyNotice from '../components/ViewOnlyNotice'

function GroupEditDrawer({ group, onClose }) {
  const { saveGroup } = useAdmin()
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: group.name,
    yearLevel: group.yearLevel,
    block: group.block,
    clinicalArea: group.clinicalArea,
    instructor: group.instructor,
    status: group.status,
    notes: group.notes,
  })
  const [error, setError] = useState('')

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      setError('Group name is required.')
      return
    }
    saveGroup(group.id, { ...group, ...form, name: form.name.trim() })
    toast(`${form.name} details updated.`, 'success')
    onClose()
  }

  return (
    <Drawer
      open
      title="Edit group details"
      subtitle={group.name}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={handleSave}>
            Save changes
          </button>
        </>
      }
    >
      <div className="adm-form-grid">
        <label className="adm-field">
          <span>Group name *</span>
          <input value={form.name} onChange={(event) => update('name', event.target.value)} />
        </label>
        <label className="adm-field">
          <span>Year level</span>
          <select value={form.yearLevel} onChange={(event) => update('yearLevel', event.target.value)}>
            {YEAR_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          <span>Block / section</span>
          <input value={form.block} onChange={(event) => update('block', event.target.value)} />
        </label>
        <label className="adm-field">
          <span>Clinical area</span>
          <input
            value={form.clinicalArea}
            onChange={(event) => update('clinicalArea', event.target.value)}
          />
        </label>
        <label className="adm-field">
          <span>Assigned clinical instructor</span>
          <select value={form.instructor} onChange={(event) => update('instructor', event.target.value)}>
            <option value="Not assigned">Not assigned</option>
            {INSTRUCTORS.map((instructor) => (
              <option key={instructor} value={instructor}>{instructor}</option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          <span>Group status</span>
          <select value={form.status} onChange={(event) => update('status', event.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
        <label className="adm-field adm-field--wide">
          <span>Notes</span>
          <textarea rows={3} value={form.notes} onChange={(event) => update('notes', event.target.value)} />
        </label>
      </div>
      {error && <p className="adm-form-error">{error}</p>}
    </Drawer>
  )
}

function GroupMembersDrawer({ group, onClose }) {
  const { students, groups, updateGroupMembers } = useAdmin()
  const { toast } = useToast()
  const [memberIds, setMemberIds] = useState([...group.memberIds])

  const handleSave = () => {
    updateGroupMembers(group.id, memberIds)
    toast(
      `${group.name} membership updated. ${memberIds.length} member${memberIds.length === 1 ? '' : 's'} assigned.`,
      'success',
    )
    onClose()
  }

  return (
    <Drawer
      open
      title="Edit membership"
      subtitle={group.name}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={handleSave}>
            Save membership
          </button>
        </>
      }
    >
      <p className="adm-card__description">.
      </p>
      <StudentSelector
        students={students}
        groups={groups}
        selectedIds={memberIds}
        onChange={setMemberIds}
        targetGroupId={group.id}
      />
    </Drawer>
  )
}

export default function AdminGroupDetailsPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const {
    groups,
    students,
    schedules,
    locations,
    records,
    canManage,
  } = useAdmin()
  const [editOpen, setEditOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)

  const group = getGroupById(groups, groupId)

  if (!group) {
    return (
      <div className="adm-page">
        <EmptyState
          title="Group not found"
          description="The group may have been removed or the link is incomplete."
          action={
            <button type="button" className="adm-btn adm-btn--secondary" onClick={() => navigate('/admin/groups')}>
              Back to groups
            </button>
          }
        />
      </div>
    )
  }

  const stats = getGroupStats(group, students)
  const members = group.memberIds
    .map((studentId) => students.find((student) => student.id === studentId))
    .filter(Boolean)
  const groupSchedules = schedules
    .filter((schedule) => schedule.groupId === group.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const groupRecords = records
    .filter((record) => record.groupId === group.id)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
  const completedRecords = groupRecords.filter((record) => record.timeIn && record.timeOut).length
  const openFlags = groupRecords.filter((record) => record.flag?.status === 'Open').length
  const attendanceRate = groupRecords.length
    ? Math.round((completedRecords / groupRecords.length) * 100)
    : 0

  return (
    <div className="adm-page">
      <Link to="/admin/groups" className="adm-back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to groups
      </Link>

      <PageIntro
        eyebrow="Group details"
        title={group.name}
        description={`${group.yearLevel} · ${group.block} · ${group.clinicalArea || 'Clinical area not set'}`}
        meta={
          <>
            <StatusBadge tone={group.status === 'Active' ? 'success' : 'neutral'} dot>
              {group.status}
            </StatusBadge>
            <span className="adm-meta-pill">
              Clinical instructor <strong>{group.instructor || 'Not assigned'}</strong>
            </span>
          </>
        }
        actions={
          <>
            <button
              type="button"
              className="adm-btn adm-btn--secondary"
              onClick={() => setEditOpen(true)}
              disabled={!canManage}
              title={!canManage ? 'Department Head access is view-only.' : undefined}
            >
              <Pencil size={16} aria-hidden="true" />
              Edit details
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--primary"
              onClick={() => setMembersOpen(true)}
              disabled={!canManage}
              title={!canManage ? 'Department Head access is view-only.' : undefined}
            >
              <UserPlus size={16} aria-hidden="true" />
              Edit membership
            </button>
          </>
        }
      />

      {!canManage && (
        <ViewOnlyNotice message="Group details can be viewed, but membership and group details cannot be edited." />
      )}

      <section className="adm-stat-grid adm-stat-grid--4" aria-label="Group summary">
        <StatCard icon={Users} label="Total members" value={stats.total} note={`${group.block} · ${group.yearLevel}`} tone="violet" />
        <StatCard icon={ScanFace} label="Registered members" value={stats.registered} note={`${stats.pending} pending · ${stats.notStarted} not started`} tone="green" />
        <StatCard icon={CalendarDays} label="Assigned schedules" value={groupSchedules.length} note={`${groupSchedules.filter((schedule) => schedule.date >= dateKey()).length} upcoming`} tone="blue" />
        <StatCard icon={ClipboardCheck} label="Attendance history" value={groupRecords.length} note={`${attendanceRate}% completed · ${openFlags} open flags`} tone="teal" />
      </section>

      <section className="adm-card adm-progress-card" aria-labelledby="group-progress-title">
        <div className="adm-progress-card__copy">
          <p className="adm-eyebrow">Facial registration</p>
          <h3 id="group-progress-title">{stats.registered} of {stats.total} members registered</h3>
          <p>
            Students open their assigned group in the mobile app and register their own face.
            Coordinators and department heads cannot register a face on a student’s behalf.
          </p>
          <ProgressBar value={stats.percent} label="Overall registration progress" />
          <div className="adm-progress-chips">
            <span className="adm-progress-chip adm-progress-chip--success">{stats.registered} registered</span>
            <span className="adm-progress-chip adm-progress-chip--warning">{stats.pending} pending capture</span>
            <span className="adm-progress-chip adm-progress-chip--neutral">{stats.notStarted} not started</span>
          </div>
        </div>
        <div
          className="adm-ring"
          style={{ background: `conic-gradient(#6d4aff ${stats.percent}%, #ece9f6 0)` }}
          role="img"
          aria-label={`${stats.percent}% of group members registered`}
        >
          <span>
            <strong>{stats.percent}%</strong>
            <small>registered</small>
          </span>
        </div>
      </section>

      <section className="adm-card" aria-labelledby="group-members-title">
        <div className="adm-card__head">
          <div>
            <p className="adm-eyebrow">Roster</p>
            <h3 id="group-members-title">Group members</h3>
          </div>
          <span className="adm-meta-pill"><strong>{stats.total}</strong> members</span>
        </div>

        {members.length ? (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Year level</th>
                  <th>Facial registration</th>
                  <th>Account</th>
                  <th>Last attendance</th>
                  <th className="adm-table__action">Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((student) => {
                  const lastRecord = records
                    .filter((record) => record.studentId === student.id)
                    .sort((a, b) => (a.date < b.date ? 1 : -1))[0]
                  const lastStatus = lastRecord ? getRecordStatus(lastRecord) : null
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="adm-person">
                          <Avatar name={student.name} size="sm" />
                          <div>
                            <strong>{student.name}</strong>
                            <span>{student.section}</span>
                          </div>
                        </div>
                      </td>
                      <td className="adm-mono">{student.id}</td>
                      <td>{student.yearLevel}</td>
                      <td>
                        <StatusBadge
                          tone={
                            student.faceRegistered
                              ? 'success'
                              : student.faceCaptureStarted
                                ? 'warning'
                                : 'neutral'
                          }
                        >
                          {student.faceRegistered
                            ? 'Registered'
                            : student.faceCaptureStarted
                              ? 'Pending capture'
                              : student.groupId
                                ? 'Not started'
                                : 'Not eligible'}
                        </StatusBadge>
                      </td>
                      <td>
                        <StatusBadge tone={student.accountStatus === 'Active' ? 'success' : 'neutral'}>
                          {student.accountStatus}
                        </StatusBadge>
                      </td>
                      <td>
                        {lastRecord ? (
                          <span className="adm-attendance-cell">
                            <span>{formatDateMedium(lastRecord.date)}</span>
                            <StatusBadge tone={lastStatus.tone}>{lastStatus.label}</StatusBadge>
                          </span>
                        ) : (
                          <span className="adm-muted">No records</span>
                        )}
                      </td>
                      <td className="adm-table__action">
                        <Link to={`/admin/students?student=${student.id}`} className="adm-text-btn">
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No members assigned"
            description="Edit membership to add students to this group."
            action={
              canManage ? (
                <button
                  type="button"
                  className="adm-btn adm-btn--primary"
                  onClick={() => setMembersOpen(true)}
                >
                  <UserPlus size={16} aria-hidden="true" />
                  Assign students
                </button>
              ) : null
            }
          />
        )}
      </section>

      <div className="adm-split-grid">
        <section className="adm-card" aria-labelledby="group-schedules-title">
          <div className="adm-card__head">
            <div>
              <p className="adm-eyebrow">Duty plan</p>
              <h3 id="group-schedules-title">Assigned schedules</h3>
            </div>
            <Link to={`/admin/schedules?group=${group.id}`} className="adm-text-link">
              View all <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {groupSchedules.length ? (
            <div className="adm-table-wrap">
              <table className="adm-table adm-table--compact">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groupSchedules.slice(0, 7).map((schedule) => {
                    const location = getLocationById(locations, schedule.locationId)
                    const status = getScheduleStatus(schedule)
                    return (
                      <tr key={schedule.id}>
                        <td>{formatDateMedium(schedule.date)}</td>
                        <td>{schedule.startTime} – {schedule.endTime}</td>
                        <td>{location?.name || 'Not assigned'}</td>
                        <td>
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No schedules assigned" description="Create a duty schedule for this group." />
          )}
        </section>

        <section className="adm-card" aria-labelledby="group-history-title">
          <div className="adm-card__head">
            <div>
              <p className="adm-eyebrow">Recent duty</p>
              <h3 id="group-history-title">Group attendance history</h3>
            </div>
            <Link to={`/admin/attendance?group=${group.id}`} className="adm-text-link">
              View all <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {groupRecords.length ? (
            <div className="adm-table-wrap">
              <table className="adm-table adm-table--compact">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>In</th>
                    <th>Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groupRecords.slice(0, 7).map((record) => {
                    const student = students.find((item) => item.id === record.studentId)
                    const status = getRecordStatus(record)
                    return (
                      <tr key={record.id}>
                        <td>{formatDateMedium(record.date)}</td>
                        <td>{student?.name || 'Student'}</td>
                        <td>{formatTime(record.timeIn)}</td>
                        <td>{formatTime(record.timeOut)}</td>
                        <td>
                          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No attendance history" description="Attendance submissions for this group will appear here." />
          )}
        </section>
      </div>

      {editOpen && <GroupEditDrawer group={group} onClose={() => setEditOpen(false)} />}
      {membersOpen && <GroupMembersDrawer group={group} onClose={() => setMembersOpen(false)} />}
    </div>
  )
}
