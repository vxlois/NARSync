import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import { getGroupStats, YEAR_LEVELS } from '../adminData'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import Pagination from '../components/Pagination'
import ProgressBar from '../components/ProgressBar'
import StatusBadge from '../components/StatusBadge'
import ViewOnlyNotice from '../components/ViewOnlyNotice'

const PAGE_SIZE = 8

export default function AdminGroupsPage() {
  const { groups, students, canManage } = useAdmin()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [yearLevel, setYearLevel] = useState('all')
  const [status, setStatus] = useState('all')
  const [needsAttention, setNeedsAttention] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [search, yearLevel, status, needsAttention])

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase()
    return groups.filter((group) => {
      if (yearLevel !== 'all' && group.yearLevel !== yearLevel) return false
      if (status !== 'all' && group.status !== status) return false
      if (needsAttention) {
        const stats = getGroupStats(group, students)
        if (stats.total > 0 && stats.registered === stats.total) return false
      }
      if (!term) return true
      return [group.name, group.instructor, group.clinicalArea]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [groups, students, search, yearLevel, status, needsAttention])

  const pageGroups = filteredGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeCount = groups.filter((group) => group.status === 'Active').length
  const inactiveCount = groups.length - activeCount
  const attentionCount = groups.filter((group) => {
    const stats = getGroupStats(group, students)
    return stats.total === 0 || stats.registered < stats.total
  }).length

  const resetFilters = () => {
    setSearch('')
    setYearLevel('all')
    setStatus('all')
    setNeedsAttention(false)
  }

  const applyQuickFilter = (filter) => {
    resetFilters()
    if (filter === 'active') setStatus('Active')
    if (filter === 'inactive') setStatus('Inactive')
    if (filter === 'attention') setNeedsAttention(true)
  }

  const quickFilters = [
    { key: 'all', label: 'All', count: groups.length },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'inactive', label: 'Inactive', count: inactiveCount },
    { key: 'attention', label: 'Needs attention', count: attentionCount },
  ]

  const activeQuickFilter =
    status === 'Active'
      ? 'active'
      : status === 'Inactive'
        ? 'inactive'
        : needsAttention
          ? 'attention'
          : !search.trim() && yearLevel === 'all' && status === 'all'
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
        actions={
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={() => navigate('/admin/groups/new')}
            disabled={!canManage}
            title={!canManage ? 'Department Head access is view-only.' : undefined}
          >
            <Plus size={16} aria-hidden="true" />
            Create group
          </button>
        }
      />

      {!canManage && (
        <ViewOnlyNotice message="View only. Groups and membership can't be changed." />
      )}

      <section className="adm-filter-card" aria-label="Group filters">
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
              placeholder="Search group, instructor, or area"
              aria-label="Search groups"
            />
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
        </div>
      </section>

      <section className="adm-card adm-card--table">
        <div className="adm-table-head">
          <div>
            <h3>Groups</h3>
            <p>{filteredGroups.length} shown</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE))}
          </span>
        </div>

        {pageGroups.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table adm-table--fit">
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Clinical instructor</th>
                    <th>Members</th>
                    <th>Registration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageGroups.map((group) => {
                    const stats = getGroupStats(group, students)
                    return (
                      <tr
                        key={group.id}
                        className="adm-table__row--clickable"
                        onClick={() => navigate(`/admin/groups/${group.id}`)}
                      >
                        <td>
                          <div className="adm-person">
                            <span className="adm-group-mark" aria-hidden="true">
                              {group.name.replace('RLE Group ', '')}
                            </span>
                            <div>
                              <button
                                type="button"
                                className="adm-table-link"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  navigate(`/admin/groups/${group.id}`)
                                }}
                              >
                                {group.name}
                              </button>
                              <span>{group.yearLevel} · {group.block}</span>
                            </div>
                          </div>
                        </td>
                        <td>{group.instructor || 'Not assigned'}</td>
                        <td>{stats.total}</td>
                        <td>
                          <div className="adm-progress-cell">
                            <span>{stats.registered}/{stats.total} registered</span>
                            <ProgressBar value={stats.percent} hideLabel />
                          </div>
                        </td>
                        <td>
                          <StatusBadge tone={group.status === 'Active' ? 'success' : 'neutral'} dot>
                            {group.status}
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
              total={filteredGroups.length}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon={UsersRound}
            title="No groups found"
            description="Adjust filters or create a group."
            action={
              canManage ? (
                <button
                  type="button"
                  className="adm-btn adm-btn--primary"
                  onClick={() => navigate('/admin/groups/new')}
                >
                  <Plus size={16} aria-hidden="true" />
                  Create group
                </button>
              ) : null
            }
          />
        )}
      </section>
    </div>
  )
}
