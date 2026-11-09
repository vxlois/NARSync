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

const SUGGESTED_NOTES = {
  'Face match below threshold': [
    'Identity confirmed against profile',
    'Checked with clinical instructor',
  ],
  'Location outside geofence': [
    'Alternate entrance confirmed',
    'Location verified with clinical instructor',
  ],
}

function FlagReviewDrawer({ record, onClose }) {
  const { canManage, resolveFlag } = useAdmin()
  const { toast } = useToast()
  const [resolution, setResolution] = useState('')
  const [error, setError] = useState('')
  const isOpen = record.flag?.status === 'Open'
  const canResolve = isOpen && canManage
  const suggestions = SUGGESTED_NOTES[record.flag?.reason] || []

  const handleResolve = () => {
    if (!resolution.trim()) {
      setError('Add a note before resolving.')
      return
    }
    try {
      resolveFlag(record.id, resolution)
      toast('Flag resolved.', 'success')
      onClose()
    } catch (resolveError) {
      setError(resolveError.message)
    }
  }

  return (
    <Drawer
      open
      title={isOpen ? 'Review flag' : 'Flag details'}
      onClose={onClose}
      size="lg"
      footer={
        canResolve ? (
          <>
            <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--primary"
              onClick={handleResolve}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              Resolve flag
            </button>
          </>
        ) : (
          <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>
            Close
          </button>
        )
      }
    >
      {!canManage && (
        <ViewOnlyNotice message="View only. Resolving flags is restricted to the RLE Coordinator." />
      )}
      <RecordDetailPanel record={record} review>
        {canResolve && (
          <section className="adm-detail-section">
            <h4>
              <ShieldCheck size={15} aria-hidden="true" /> Resolution
            </h4>
            <p className="adm-resolution__hint">Add a short note on what you verified.</p>
            <label className={`adm-field ${error ? 'has-error' : ''}`}>
              <span>Resolution note *</span>
              <textarea
                rows={3}
                value={resolution}
                onChange={(event) => {
                  setResolution(event.target.value)
                  setError('')
                }}
                placeholder="What did you check?"
              />
              {error && <small className="adm-field__error">{error}</small>}
            </label>
            {suggestions.length > 0 && (
              <div className="adm-note-chips">
                <span>Suggested</span>
                {suggestions.map((note) => (
                  <button
                    key={note}
                    type="button"
                    className="adm-note-chip"
                    onClick={() => {
                      setResolution(note)
                      setError('')
                    }}
                  >
                    {note}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </RecordDetailPanel>
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

  const resetFilters = () => {
    setSearch('')
    setStatus('Open')
    setReason('all')
    setGroupId('all')
    setDate('')
  }

  const applyQuickFilter = (filter) => {
    setSearch('')
    setReason('all')
    setGroupId('all')
    setDate('')
    setStatus(filter === 'open' ? 'Open' : filter === 'resolved' ? 'Resolved' : 'all')
  }

  const quickFilters = [
    { key: 'all', label: 'All', count: flagged.length },
    { key: 'open', label: 'Open', count: openCount },
    { key: 'resolved', label: 'Resolved', count: resolvedCount },
  ]

  const activeQuickFilter =
    status === 'Open'
      ? 'open'
      : status === 'Resolved'
        ? 'resolved'
        : !search.trim() && reason === 'all' && groupId === 'all' && !date
          ? 'all'
          : ''

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
      />

      {!canManage && (
        <ViewOnlyNotice message="View only. Flags can't be resolved." />
      )}

      <section className="adm-filter-card" aria-label="Flag filters">
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
              placeholder="Search student, group, or location"
              aria-label="Search flagged records"
            />
          </label>
          <label className="adm-field adm-field--inline">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
              <option value="all">All statuses</option>
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Reason</span>
            <select value={reason} onChange={(event) => setReason(event.target.value)}>
              <option value="all">All reasons</option>
              {reasons.map((flagReason) => (
                <option key={flagReason} value={flagReason}>{flagReason}</option>
              ))}
            </select>
          </label>
          <label className="adm-field adm-field--inline">
            <span>Date</span>
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
            <h3>Flags</h3>
            <p>{filtered.length} shown</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
          </span>
        </div>

        {pageRecords.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table adm-table--fit">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Flag</th>
                    <th>Duty date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.map((record) => {
                    const student = getStudentById(students, record.studentId)
                    const location = getLocationById(locations, record.locationId)
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
                          <span className="adm-flag-reason">
                            <AlertTriangle size={15} aria-hidden="true" />
                            <span>
                              <strong>{record.flag.reason}</strong>
                              <span>{record.flag.detail.slice(0, 64)}…</span>
                            </span>
                          </span>
                        </td>
                        <td>
                          <div className="adm-cell-stack">
                            <strong>{formatDateMedium(record.date)}</strong>
                            <span className="adm-cell-sub">{location?.name || 'No location'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="adm-cell-stack">
                            <StatusBadge tone={record.flag.status === 'Open' ? 'danger' : 'success'} dot>
                              {record.flag.status}
                            </StatusBadge>
                            <span className="adm-cell-sub">
                              {record.flag.raisedBy} · {formatTime(record.flag.raisedAt)}
                            </span>
                          </div>
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
            title={status === 'Open' ? 'No open flags' : 'No flags'}
            description={
              flagged.length
                ? status === 'Open'
                  ? 'All flags have been reviewed.'
                  : 'Adjust the filters to see more.'
                : 'Flags will appear here when a submission needs review.'
            }
            action={
              flagged.length ? (
                <button
                  type="button"
                  className="adm-btn adm-btn--secondary"
                  onClick={() => (status === 'Open' ? applyQuickFilter('all') : resetFilters())}
                >
                  {status === 'Open' ? 'Show all' : 'Clear filters'}
                </button>
              ) : null
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
