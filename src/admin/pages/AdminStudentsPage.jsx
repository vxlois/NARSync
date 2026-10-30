import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Download,
  Mail,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  UserRound,
  UserX,
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
  { value: 'all', label: 'All facial statuses' },
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
        <ViewOnlyNotice message="Group assignments cannot be changed with the Department Head profile." />
      )}

      <div className="adm-record-hero">
        <Avatar name={student.name} size="lg" />
        <div>
          <h3>{student.name}</h3>
          <p>{student.id} · {student.section}</p>
        </div>
        <StatusBadge tone={student.accountStatus === 'Active' ? 'success' : 'neutral'}>
          {student.accountStatus}
        </StatusBadge>
      </div>

      <div className="adm-detail-grid">
        <div>
          <span>Year level</span>
          <strong>{student.yearLevel}</strong>
        </div>
        <div>
          <span>Assigned group</span>
          <strong>{group?.name || 'Unassigned'}</strong>
        </div>
        <div>
          <span>Facial registration</span>
          <strong>{faceStatus.label}</strong>
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
        <div
          className={`adm-eligibility ${
            student.groupId ? 'adm-eligibility--eligible' : 'adm-eligibility--blocked'
          }`}
        >
          {student.groupId ? <ShieldCheck size={17} aria-hidden="true" /> : <UserX size={17} aria-hidden="true" />}
          <div>
            <strong>
              {student.groupId
                ? 'Eligible for group-based facial registration'
                : 'Facial registration is locked'}
            </strong>
            <p>
              {student.groupId
                ? `${student.name} can open ${group?.name} in the student app and register their own face.`
                : 'Assign this student to an RLE group first. Students cannot register a face until they belong to a group.'}
            </p>
          </div>
        </div>

        <div className="adm-inline-form">
          <label className="adm-field">
            <span>Assigned group</span>
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
            {saving ? 'Saving…' : 'Update assignment'}
          </button>
        </div>
        <p className="adm-fineprint">
          Students may belong to one group at a time. Moving a student removes them from their
          previous group and updates both groups&apos; registration progress.
        </p>
      </section>

      <section className="adm-detail-section">
        <h4>
          <UserCheck size={15} aria-hidden="true" /> Attendance snapshot
        </h4>
        <div className="adm-mini-stats">
          <div>
            <span>Submitted records</span>
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
            description="Attendance submissions will appear after the student’s first duty."
          />
        )}
        <Link to={`/admin/attendance?student=${student.id}`} className="adm-text-link">
          View all attendance records
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
  const [selectedStudentId, setSelectedStudentId] = useState(null)

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    setGroupId(searchParams.get('group') || 'all')
    setYearLevel(searchParams.get('year') || 'all')
    setFaceStatus(searchParams.get('face') || 'all')
    setAccountStatus(searchParams.get('account') || 'all')
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [search, groupId, yearLevel, faceStatus, accountStatus])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()
    return students.filter((student) => {
      if (groupId === 'unassigned' && student.groupId) return false
      if (groupId !== 'all' && groupId !== 'unassigned' && student.groupId !== groupId) return false
      if (yearLevel !== 'all' && student.yearLevel !== yearLevel) return false
      if (accountStatus !== 'all' && student.accountStatus !== accountStatus) return false
      if (faceStatus !== 'all' && getFaceStatus(student).key !== faceStatus) return false
      if (!term) return true
      const group = getGroupById(groups, student.groupId)
      return [student.name, student.id, student.email, group?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [students, groups, search, groupId, yearLevel, faceStatus, accountStatus])

  const pageStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const assigned = students.filter((student) => student.groupId).length
  const registered = students.filter((student) => student.faceRegistered).length
  const unassigned = students.length - assigned

  const resetFilters = () => {
    setSearch('')
    setGroupId('all')
    setYearLevel('all')
    setFaceStatus('all')
    setAccountStatus('all')
  }

  const exportStudents = () => {
    downloadCsv(
      `narsync-students-${dateKey()}.csv`,
      ['Student ID', 'Name', 'Year level', 'Assigned group', 'Facial registration', 'Account status'],
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
        eyebrow="Registry"
        title="Student management"
        meta={
          <>
            <span className="adm-meta-pill"><strong>{students.length}</strong> students</span>
            <span className="adm-meta-pill"><strong>{assigned}</strong> assigned</span>
            <span className="adm-meta-pill"><strong>{unassigned}</strong> unassigned</span>
            <span className="adm-meta-pill"><strong>{registered}</strong> face registered</span>
          </>
        }
        actions={
          <button type="button" className="adm-btn adm-btn--secondary" onClick={exportStudents}>
            <Download size={16} aria-hidden="true" />
            Export students
          </button>
        }
      />

      {!canManage && (
        <ViewOnlyNotice message="Student details and group assignments can be viewed, but assignments cannot be changed." />
      )}

      <section className="adm-filter-card" aria-label="Student filters">
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
              placeholder="Search name, student ID, group, or email"
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
            <span>Facial registration</span>
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
            <h3>Student roster</h3>
            <p>{filteredStudents.length} students match the current filters.</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))}
          </span>
        </div>

        {pageStudents.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Year level</th>
                    <th>Assigned group</th>
                    <th>Facial registration</th>
                    <th>Account status</th>
                    <th className="adm-table__action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageStudents.map((student) => {
                    const group = getGroupById(groups, student.groupId)
                    const face = getFaceStatus(student)
                    return (
                      <tr key={student.id}>
                        <td>
                          <div className="adm-person">
                            <Avatar name={student.name} size="sm" />
                            <div>
                              <button
                                type="button"
                                className="adm-table-link"
                                onClick={() => setSelectedStudentId(student.id)}
                              >
                                {student.name}
                              </button>
                              <span>{student.section}</span>
                            </div>
                          </div>
                        </td>
                        <td className="adm-mono">{student.id}</td>
                        <td>{student.yearLevel}</td>
                        <td>
                          {group ? (
                            <span className="adm-group-cell">
                              <strong>{group.name}</strong>
                            </span>
                          ) : (
                            <StatusBadge tone="neutral">Unassigned</StatusBadge>
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
                        <td className="adm-table__action">
                          <button
                            type="button"
                            className="adm-text-btn"
                            onClick={() => setSelectedStudentId(student.id)}
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
        open={Boolean(selectedStudentId)}
        title="Student details"
        subtitle={
          selectedStudentId
            ? students.find((student) => student.id === selectedStudentId)?.id
            : ''
        }
        onClose={() => setSelectedStudentId(null)}
        size="lg"
      >
        {selectedStudentId && (
          <StudentDetailDrawer studentId={selectedStudentId} />
        )}
      </Drawer>
    </div>
  )
}
