import { useEffect, useMemo, useState } from 'react'
import { CalendarX2, Search, X } from 'lucide-react'
import RecordCard from '../components/RecordCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { useApp } from '../context/AppContext'
import { getRecordStatus, matchesStatusFilter, statusMeta } from '../utils/attendance'
import { dateKey, formatDateLong } from '../utils/format'

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'present', label: 'Present' },
  { id: 'late', label: 'Late' },
  { id: 'incomplete', label: 'Incomplete' },
  { id: 'absent', label: 'Absent' },
]

function SkeletonRecord() {
  return (
    <div className="skeleton-record">
      <Skeleton className="skeleton" />
      <div className="skeleton-record__body">
        <Skeleton style={{ height: 9, width: '38%', borderRadius: 6 }} />
        <Skeleton style={{ height: 13, width: '72%', borderRadius: 6 }} />
        <Skeleton style={{ height: 9, width: '55%', borderRadius: 6 }} />
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const { records } = useApp()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650)
    return () => window.clearTimeout(timer)
  }, [])

  const counts = useMemo(() => {
    const initial = { all: records.length, present: 0, late: 0, incomplete: 0, absent: 0 }
    return records.reduce((totals, record) => {
      const status = getRecordStatus(record)
      const key = status === 'in_progress' ? 'incomplete' : status
      if (totals[key] !== undefined) totals[key] += 1
      return totals
    }, initial)
  }, [records])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return records.filter((record) => {
      if (!matchesStatusFilter(record, statusFilter)) return false
      if (dateFilter && record.date !== dateFilter) return false
      if (!needle) return true
      const searchable = [
        record.duty?.facility,
        record.duty?.clinicalArea,
        record.duty?.group,
        formatDateLong(record.date),
        statusMeta(record).label,
        record.note,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return searchable.includes(needle)
    })
  }, [records, statusFilter, dateFilter, query])

  const hasFilters = Boolean(query || dateFilter || statusFilter !== 'all')

  const resetFilters = () => {
    setQuery('')
    setDateFilter('')
    setStatusFilter('all')
  }

  return (
    <div className="screen">
      <header className="tab-header">
        <div>
          <h1>Attendance history</h1>
          <p>Review submitted duty attendance records.</p>
        </div>
        <Badge tone="violet">{records.length} records</Badge>
      </header>

      <div className="history-tools">
        <div className="input-wrap history-search">
          <Search size={17} aria-hidden="true" />
          <input
            className="input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search location or status"
            aria-label="Search attendance records"
          />
          {query && (
            <button
              type="button"
              className="input-action"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <div
          className="filter-chips"
          role="group"
          aria-label="Filter attendance by status"
        >
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`chip ${statusFilter === filter.id ? 'is-active' : ''}`.trim()}
              onClick={() => setStatusFilter(filter.id)}
              aria-pressed={statusFilter === filter.id}
            >
              {filter.label}
              <span className="chip__count">{counts[filter.id]}</span>
            </button>
          ))}
        </div>

        <div className="date-filter">
          <label className="date-filter__field" htmlFor="history-date">
            <span className="sr-only">Filter by duty date</span>
            <span className="field__label" aria-hidden="true" style={{ margin: 0 }}>Date</span>
            <input
              id="history-date"
              type="date"
              value={dateFilter}
              max={dateKey()}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          </label>
          {dateFilter && (
            <Button variant="outline" size="sm" icon={X} onClick={() => setDateFilter('')}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="history-result-count">
        <span>
          {filtered.length} of {records.length} records
        </span>
        {hasFilters && (
          <button type="button" className="text-link" onClick={resetFilters}>
            Reset filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="record-list" aria-label="Loading attendance records" role="status">
          <SkeletonRecord />
          <SkeletonRecord />
          <SkeletonRecord />
          <span className="sr-only">Loading attendance history…</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="record-list">
          {filtered.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarX2}
          title="No attendance records found"
          description={
            records.length === 0
              ? 'Your submitted attendance will appear here.'
              : 'No records match the selected date, status, or search. Try clearing your filters.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Reset filters
              </Button>
            ) : null
          }
        />
      )}
    </div>
  )
}
