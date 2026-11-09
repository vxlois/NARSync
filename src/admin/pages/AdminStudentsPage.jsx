import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Download,
  Mail,
  Phone,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import {
  getFaceStatus,
  getGroupById,
  getRecordStatus,
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
import StatusBadge from '../components/StatusBadge'
import ViewOnlyNotice from '../components/ViewOnlyNotice'

const PAGE_SIZE = 10
const FACE_FILTERS = [
  { value: 'all', label: 'All face statuses' },
  { value: 'unregistered', label: 'Not registered' },
  { value: 'registered', label: 'Registered' },
  { value: 'pending', label: 'Pending capture' },
  { value: 'not-started', label: 'Not started' },
  { value: 'not-eligible', label: 'Not eligible' },
]

function StudentDetailDrawer({ studentId }) {
  const {
    students,
    groups,
    records,
    locations,
    canManage,
    assignStudentToGroup,
  } = useAdmin()
  const { toast } = useToast()
  const student = students.find((item) => item.id === studentId)
  const [assignment, setAssignment] = useState(student?.groupId || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setAssignment(student?.groupId || '')
  }, [student?.groupId, student?.id])

  if (!student) return null

  const group = getGroupById(groups, student.groupId)
  const faceStatus = getFaceStatus(student)
  const studentRecords = records
    .filter((record) => record.studentId === student.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const completed = studentRecords.filter((record) => record.timeIn && record.timeOut).length
  const flagged = studentRecords.filter((record) => record.flag?.status === 'Open').length

  const handleSave = () => {
    if (assignment === (student.groupId || '')) return
    setSaving(true)
    try {
      assignStudentToGroup(student.id, assignment || null)
      toast(
        assignment
          ? `${student.name} was assigned to ${getGroupById(groups, assignment)?.name}.`
          : `${student.name} is now unassigned. Facial registration is no longer available.`,
        'success',
      )
    } catch (error) {
      toast(error.message, 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="adm-student-detail">
      {!canManage && (
        <ViewOnlyNotice message="View only. Group assignments can't be changed." />
      )}

      <div className="adm-record-hero">
        <Avatar name={student.name} size="lg" />
        <div>
          <h3>{student.name}</h3>
          <p>{student.id} · {student.yearLevel} · {student.section}</p>
        </div>
        <StatusBadge tone={student.accountStatus === 'Active' ? 'success' : 'neutral'}>
          {student.accountStatus}
        </StatusBadge>
      </div>

      <div className="adm-detail-grid">
        <div>
          <span>Assigned group</span>
          <strong>{group?.name || 'Unassigned'}</strong>
        </div>
        <div>
          <span>Face registration</span>
          <StatusBadge tone={faceStatus.tone}>{faceStatus.label}</StatusBadge>
        </div>
        <div>
          <span>Email</span>
          <strong className="adm-detail-grid__truncate">
            <Mail size={13} aria-hidden="true" /> {student.email}
          </strong>
        </div>
        <div>
          <span>Mobile</span>
          <strong>
            <Phone size={13} aria-hidden="true" /> {student.phone}
          </strong>
        </div>
      </div>

      <section className="adm-detail-section">
        <h4>
          <UserRound size={15} aria-hidden="true" /> Group assignment
        </h4>

        <div className="adm-inline-form">
          <label className="adm-field">
            <span>Group</span>
            <select
              value={assignment}
              onChange={(event) => setAssignment(event.target.value)}
              disabled={!canManage}
            >
              <option value="">Unassigned</option>
              {groups.map((groupOption) => (
                <option key={groupOption.id} value={groupOption.id}>
                  {groupOption.name} ({groupOption.status})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={handleSave}
            disabled={!canManage || saving || assignment === (student.groupId || '')}
            title={!canManage ? 'Department Head access is view-only.' : undefined}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {!student.groupId && (
          <p className="adm-fineprint">
            Assign a group before this student can register their face.
          </p>
        )}
      </section>

      <section className="adm-detail-section">
        <h4>
          <UserCheck size={15} aria-hidden="true" /> Attendance
        </h4>
        <div className="adm-mini-stats">
          <div>
            <span>Records</span>
            <strong>{studentRecords.length}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>{completed}</strong>
          </div>
          <div>
            <span>Open flags</span>
            <strong>{flagged}</strong>
          </div>
        </div>

        {studentRecords.length ? (
          <div className="adm-table-wrap adm-table-wrap--compact">
            <table className="adm-table adm-table--compact">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentRecords.slice(0, 6).map((record) => {
                  const status = getRecordStatus(record)
                  const location = locations.find((item) => item.id === record.locationId)
                  return (
                    <tr key={record.id}>
                      <td>{formatDateMedium(record.date)}</td>
                      <td>{location?.name || '—'}</td>
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
          <EmptyState
            title="No attendance records yet"
            description="Records appear after the student’s first duty."
          />
        )}
        <Link to={`/admin/attendance?student=${student.id}`} className="adm-text-link">
          View all attendance
        </Link>
      </section>
    </div>
  )
}

export default function AdminStudentsPage() {
  const { students, groups, canManage } = useAdmin()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [groupId, setGroupId] = useState(searchParams.get('group') || 'all')
  const [yearLevel, setYearLevel] = useState(searchParams.get('year') || 'all')
  const [faceStatus, setFaceStatus] = useState(searchParams.get('face') || 'all')
  const [accountStatus, setAccountStatus] = useState(searchParams.get('account') || 'all')
  const [page, setPage] = useState(1)
  const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get('student') || null)

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    setGroupId(searchParams.get('group') || 'all')
    setYearLevel(searchParams.get('year') || 'all')
    setFaceStatus(searchParams.get('face') || 'all')
    setAccountStatus(searchParams.get('account') || 'all')
    setSelectedStudentId(searchParams.get('student') || null)
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [search, groupId, yearLevel, faceStatus, accountStatus])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()
    return students.filter((student) => {
      const face = getFaceStatus(student)
      if (groupId === 'unassigned' && student.groupId) return false
      if (groupId !== 'all' && groupId !== 'unassigned' && student.groupId !== groupId) return false
      if (yearLevel !== 'all' && student.yearLevel !== yearLevel) return false
      if (accountStatus !== 'all' && student.accountStatus !== accountStatus) return false
      if (faceStatus === 'unregistered' && face.key === 'registered') return false
      if (faceStatus !== 'all' && faceStatus !== 'unregistered' && face.key !== faceStatus) return false
      if (!term) return true
      const group = getGroupById(groups, student.groupId)
      return [student.name, student.id, student.email, group?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [students, groups, search, groupId, yearLevel, faceStatus, accountStatus])

  const pageStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const assigned = students.filter((student) => student.groupId).length
  const unassigned = students.length - assigned
  const notRegistered = students.filter((student) => !student.faceRegistered).length
  const inactive = students.filter((student) => student.accountStatus !== 'Active').length
  const selectedStudent = students.find((student) => student.id === selectedStudentId)

  const resetFilters = () => {
    setSearch('')
    setGroupId('all')
    setYearLevel('all')
    setFaceStatus('all')
    setAccountStatus('all')
  }

  const applyQuickFilter = (filter) => {
    resetFilters()
    if (filter === 'unassigned') setGroupId('unassigned')
    if (filter === 'unregistered') setFaceStatus('unregistered')
    if (filter === 'inactive') setAccountStatus('Inactive')
  }

  const quickFilters = [
    { key: 'all', label: 'All', count: students.length },
    { key: 'unassigned', label: 'Unassigned', count: unassigned },
    { key: 'unregistered', label: 'Not registered', count: notRegistered },
    { key: 'inactive', label: 'Inactive', count: inactive },
  ]

  const activeQuickFilter =
    groupId === 'unassigned'
      ? 'unassigned'
      : faceStatus === 'unregistered'
        ? 'unregistered'
        : accountStatus === 'Inactive'
          ? 'inactive'
          : !search.trim() &&
              groupId === 'all' &&
              yearLevel === 'all' &&
              faceStatus === 'all' &&
              accountStatus === 'all'
            ? 'all'
            : ''

  const exportStudents = () => {
    downloadCsv(
      `narsync-students-${dateKey()}.csv`,
      ['Student ID', 'Name', 'Year level', 'Assigned group', 'Face status', 'Account status'],
      filteredStudents.map((student) => {
        const group = getGroupById(groups, student.groupId)
        return [
          student.id,
          student.name,
          student.yearLevel,
          group?.name || 'Unassigned',
          getFaceStatus(student).label,
          student.accountStatus,
        ]
      }),
    )
    toast('Student list exported as CSV.', 'success')
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
          <button type="button" className="adm-btn adm-btn--secondary" onClick={exportStudents}>
            <Download size={16} aria-hidden="true" />
            Export CSV
          </button>
        }
      />

      {!canManage && (
        <ViewOnlyNotice message="View only. Group assignments can't be changed." />
      )}

      <section className="adm-filter-card" aria-label="Student filters">
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
              placeholder="Search name, ID, email, or group"
              aria-label="Search students"
            />
          </label>
          <label className="adm-field adm-field--inline">
            <span>Group</span>
            <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
              <option value="all">All groups</option>
              <option value="unassigned">Unassigned</option>
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
              <option value="all">All years</option>
              {YEAR_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Face status</span>
            <select value={faceStatus} onChange={(event) => setFaceStatus(event.target.value)}>
              {FACE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Account</span>
            <select value={accountStatus} onChange={(event) => setAccountStatus(event.target.value)}>
              <option value="all">All accounts</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
      </section>

      <section className="adm-card adm-card--table">
        <div className="adm-table-head">
          <div>
            <h3>Students</h3>
            <p>{filteredStudents.length} shown</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))}
          </span>
        </div>

        {pageStudents.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table adm-table--fit">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Year level</th>
                    <th>Assigned group</th>
                    <th>Face status</th>
                    <th>Account</th>
                  </tr>
                </thead>
                <tbody>
                  {pageStudents.map((student) => {
                    const group = getGroupById(groups, student.groupId)
                    const face = getFaceStatus(student)
                    return (
                      <tr
                        key={student.id}
                        className="adm-table__row--clickable"
                        onClick={() => setSelectedStudentId(student.id)}
                      >
                        <td>
                          <div className="adm-person">
                            <Avatar name={student.name} size="sm" />
                            <div>
                              <button
                                type="button"
                                className="adm-table-link"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setSelectedStudentId(student.id)
                                }}
                              >
                                {student.name}
                              </button>
                              <span className="adm-mono">{student.id} · {student.section}</span>
                            </div>
                          </div>
                        </td>
                        <td>{student.yearLevel}</td>
                        <td>
                          {group ? (
                            <span className="adm-group-cell">
                              <strong>{group.name}</strong>
                            </span>
                          ) : (
                            <StatusBadge tone="warning">Unassigned</StatusBadge>
                          )}
                        </td>
                        <td>
                          <StatusBadge tone={face.tone}>{face.label}</StatusBadge>
                        </td>
                        <td>
                          <StatusBadge tone={student.accountStatus === 'Active' ? 'success' : 'neutral'} dot>
                            {student.accountStatus}
                          </StatusBadge>
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
              total={filteredStudents.length}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No students found"
            description="Adjust the search or filters to find a student."
            action={
              <button type="button" className="adm-btn adm-btn--secondary" onClick={resetFilters}>
                Clear filters
              </button>
            }
          />
        )}
      </section>

      <Drawer
        open={Boolean(selectedStudent)}
        title="Student details"
        onClose={() => setSelectedStudentId(null)}
        size="lg"
      >
        {selectedStudent && (
          <StudentDetailDrawer studentId={selectedStudent.id} />
        )}
      </Drawer>
    </div>
  )
}
