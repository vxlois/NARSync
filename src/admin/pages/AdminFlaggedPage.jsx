import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import {
  getGroupById,
  getLocationById,
  getStudentById,
} from '../adminData'
import { useToast } from '../../context/ToastContext'
import { formatDateMedium, formatTime } from '../../utils/format'
import Avatar from '../components/Avatar'
import Drawer from '../components/Drawer'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import Pagination from '../components/Pagination'
import RecordDetailPanel from '../components/RecordDetailPanel'
import StatusBadge from '../components/StatusBadge'
import ViewOnlyNotice from '../components/ViewOnlyNotice'

const PAGE_SIZE = 10

function FlagReviewDrawer({ record, onClose }) {
  const { canManage, resolveFlag } = useAdmin()
  const { toast } = useToast()
  const [resolution, setResolution] = useState('')
  const [error, setError] = useState('')

  const handleResolve = () => {
    if (!resolution.trim()) {
      setError('Add a short resolution note before closing the flag.')
      return
    }
    try {
      resolveFlag(record.id, resolution)
      toast('Flag resolved. The attendance record has been updated.', 'success')
      onClose()
    } catch (resolveError) {
      setError(resolveError.message)
    }
  }

  return (
    <Drawer
      open
      title="Flagged record review"
      subtitle={`${record.flag?.reason} · ${formatDateMedium(record.date)}`}
      onClose={onClose}
      size="lg"
    >
      {!canManage && (
        <ViewOnlyNotice message="Flagged records can be reviewed, but resolving flags is restricted to the RLE Coordinator." />
      )}
      <RecordDetailPanel record={record} />

      {record.flag?.status === 'Open' && (
        <section className="adm-detail-section">
          <h4>
            <ShieldCheck size={15} aria-hidden="true" /> Coordinator resolution
          </h4>
          <label className={`adm-field ${error ? 'has-error' : ''}`}>
            <span>Resolution note *</span>
            <textarea
              rows={4}
              value={resolution}
              onChange={(event) => {
                setResolution(event.target.value)
                setError('')
              }}
              placeholder="Describe the verification step taken before accepting or dismissing this flag."
              disabled={!canManage}
            />
            {error && <small className="adm-field__error">{error}</small>}
          </label>
          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--primary"
              onClick={handleResolve}
              disabled={!canManage}
              title={!canManage ? 'Department Head access is view-only.' : undefined}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              Resolve flag
            </button>
          </div>
        </section>
      )}
    </Drawer>
  )
}

export default function AdminFlaggedPage() {
  const { records, students, groups, locations, canManage } = useAdmin()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || 'Open')
  const [reason, setReason] = useState('all')
  const [groupId, setGroupId] = useState(searchParams.get('group') || 'all')
  const [date, setDate] = useState(searchParams.get('date') || '')
  const [page, setPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    setStatus(searchParams.get('status') || 'Open')
    setGroupId(searchParams.get('group') || 'all')
    setDate(searchParams.get('date') || '')
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [search, status, reason, groupId, date])

  const flagged = useMemo(
    () => records.filter((record) => record.flag).sort((a, b) => (a.flag.raisedAt < b.flag.raisedAt ? 1 : -1)),
    [records],
  )

  const reasons = [...new Set(flagged.map((record) => record.flag.reason))]

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return flagged.filter((record) => {
      const student = getStudentById(students, record.studentId)
      const group = getGroupById(groups, record.groupId)
      const location = getLocationById(locations, record.locationId)
      if (status !== 'all' && record.flag.status !== status) return false
      if (reason !== 'all' && record.flag.reason !== reason) return false
      if (groupId !== 'all' && record.groupId !== groupId) return false
      if (date && record.date !== date) return false
      if (!term) return true
      return [student?.name, student?.id, group?.name, location?.name, record.flag.detail]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [flagged, students, groups, locations, search, status, reason, groupId, date])

  const pageRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const openCount = flagged.filter((record) => record.flag.status === 'Open').length
  const resolvedCount = flagged.filter((record) => record.flag.status === 'Resolved').length
  const faceFlags = flagged.filter(
    (record) => record.flag.reason === 'Face match below threshold' && record.flag.status === 'Open',
  ).length
  const locationFlags = flagged.filter(
    (record) => record.flag.reason === 'Location outside geofence' && record.flag.status === 'Open',
  ).length

  const resetFilters = () => {
    setSearch('')
    setStatus('Open')
    setReason('all')
    setGroupId('all')
    setDate('')
  }

  return (
    <div className="adm-page">
      <PageIntro
        eyebrow="Verification queue"
        title="Flagged records"
        meta={
          <>
            <span className="adm-meta-pill"><strong>{openCount}</strong> open</span>
            <span className="adm-meta-pill"><strong>{resolvedCount}</strong> resolved</span>
            <span className="adm-meta-pill"><strong>{faceFlags}</strong> face match</span>
            <span className="adm-meta-pill"><strong>{locationFlags}</strong> location</span>
          </>
        }
      />

      {!canManage && (
        <ViewOnlyNotice message="Flagged records can be reviewed, but resolutions are restricted to the RLE Coordinator." />
      )}

      <section className="adm-filter-card" aria-label="Flag filters">
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
              placeholder="Search student, group, location, or flag detail"
              aria-label="Search flagged records"
            />
          </label>
          <label className="adm-field adm-field--inline">
            <span>Review status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
              <option value="all">All statuses</option>
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Flag reason</span>
            <select value={reason} onChange={(event) => setReason(event.target.value)}>
              <option value="all">All reasons</option>
              {reasons.map((flagReason) => (
                <option key={flagReason} value={flagReason}>{flagReason}</option>
              ))}
            </select>
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
        </div>
      </section>

      <section className="adm-card adm-card--table">
        <div className="adm-table-head">
          <div>
            <h3>Flag review queue</h3>
            <p>{filtered.length} flagged records match the current filters.</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
          </span>
        </div>

        {pageRecords.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Flag reason</th>
                    <th>Duty date</th>
                    <th>Clinical location</th>
                    <th>Raised by</th>
                    <th>Review status</th>
                    <th className="adm-table__action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.map((record) => {
                    const student = getStudentById(students, record.studentId)
                    const location = getLocationById(locations, record.locationId)
                    return (
                      <tr key={record.id}>
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
                          <span className="adm-flag-reason">
                            <AlertTriangle size={15} aria-hidden="true" />
                            <span>
                              <strong>{record.flag.reason}</strong>
                              <span>{record.flag.detail.slice(0, 64)}…</span>
                            </span>
                          </span>
                        </td>
                        <td>{formatDateMedium(record.date)}</td>
                        <td>{location?.name || '—'}</td>
                        <td>
                          <span className="adm-group-cell">
                            <strong>{record.flag.raisedBy}</strong>
                            <span>{formatTime(record.flag.raisedAt)}</span>
                          </span>
                        </td>
                        <td>
                          <StatusBadge tone={record.flag.status === 'Open' ? 'danger' : 'success'} dot>
                            {record.flag.status}
                          </StatusBadge>
                        </td>
                        <td className="adm-table__action">
                          <button
                            type="button"
                            className="adm-text-btn"
                            onClick={() => setSelectedRecord(record)}
                          >
                            {record.flag.status === 'Open' ? 'Review' : 'View'}
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
              total={filtered.length}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon={status === 'Open' ? CheckCircle2 : Flag}
            title={status === 'Open' ? 'No open flags' : 'No flagged records found'}
            description={
              status === 'Open'
                ? 'All verification flags have been reviewed for the current filters.'
                : 'Adjust the search or filters to review flagged records.'
            }
            action={
              <button type="button" className="adm-btn adm-btn--secondary" onClick={resetFilters}>
                Reset filters
              </button>
            }
          />
        )}
      </section>

      {selectedRecord && (
        <FlagReviewDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  )
}
