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
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [search, yearLevel, status])

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase()
    return groups.filter((group) => {
      if (yearLevel !== 'all' && group.yearLevel !== yearLevel) return false
      if (status !== 'all' && group.status !== status) return false
      if (!term) return true
      return [group.name, group.instructor, group.clinicalArea]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [groups, search, yearLevel, status])

  const pageGroups = filteredGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalMembers = groups.reduce((total, group) => total + group.memberIds.length, 0)
  const totalRegistered = students.filter((student) => student.groupId && student.faceRegistered).length
  const overallProgress = totalMembers ? Math.round((totalRegistered / totalMembers) * 100) : 0

  const resetFilters = () => {
    setSearch('')
    setYearLevel('all')
    setStatus('all')
  }

  return (
    <div className="adm-page">
      <PageIntro
        eyebrow="Facial registration workflow"
        title="Group management"
        meta={
          <>
            <span className="adm-meta-pill"><strong>{groups.length}</strong> groups</span>
            <span className="adm-meta-pill"><strong>{totalMembers}</strong> members</span>
            <span className="adm-meta-pill"><strong>{overallProgress}%</strong> registered</span>
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
        <ViewOnlyNotice message="Groups and membership can be viewed, but creating or editing groups is restricted to the RLE Coordinator." />
      )}

      <section className="adm-workflow-note" aria-label="Registration workflow">
        <span className="adm-workflow-note__step">1 <strong>Create group</strong></span>
        <span aria-hidden="true">→</span>
        <span className="adm-workflow-note__step">2 <strong>Assign students</strong></span>
        <span aria-hidden="true">→</span>
        <span className="adm-workflow-note__step">3 <strong>Students register their own faces</strong></span>
        <span aria-hidden="true">→</span>
        <span className="adm-workflow-note__step">4 <strong>Progress updates</strong></span>
      </section>

      <section className="adm-filter-card" aria-label="Group filters">
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
              placeholder="Search group, instructor, or clinical area"
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
          <label className="adm-field adm-field--inline">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
      </section>

      <section className="adm-card adm-card--table">
        <div className="adm-table-head">
          <div>
            <h3>RLE groups</h3>
            <p>{filteredGroups.length} groups match the current filters.</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE))}
          </span>
        </div>

        {pageGroups.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Year &amp; block</th>
                    <th>Clinical instructor</th>
                    <th>Members</th>
                    <th>Facial registration</th>
                    <th>Status</th>
                    <th className="adm-table__action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageGroups.map((group) => {
                    const stats = getGroupStats(group, students)
                    return (
                      <tr key={group.id}>
                        <td>
                          <div className="adm-person">
                            <span className="adm-group-mark" aria-hidden="true">
                              {group.name.replace('RLE Group ', '')}
                            </span>
                            <div>
                              <button
                                type="button"
                                className="adm-table-link"
                                onClick={() => navigate(`/admin/groups/${group.id}`)}
                              >
                                {group.name}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="adm-group-cell">
                            <strong>{group.yearLevel}</strong>
                            <span>{group.block}</span>
                          </span>
                        </td>
                        <td>{group.instructor || 'Not assigned'}</td>
                        <td>{stats.total}</td>
                        <td>
                          <div className="adm-progress-cell">
                            <span>{stats.registered} of {stats.total} registered</span>
                            <ProgressBar value={stats.percent} hideLabel />
                          </div>
                        </td>
                        <td>
                          <StatusBadge tone={group.status === 'Active' ? 'success' : 'neutral'} dot>
                            {group.status}
                          </StatusBadge>
                        </td>
                        <td className="adm-table__action">
                          <button
                            type="button"
                            className="adm-text-btn"
                            onClick={() => navigate(`/admin/groups/${group.id}`)}
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
              total={filteredGroups.length}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon={UsersRound}
            title="No groups found"
            description="Adjust the filters or create a new RLE group."
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
