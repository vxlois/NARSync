import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Info, Save, UsersRound } from 'lucide-react'
import { useAdmin } from '../AdminContext'
import { INSTRUCTORS, YEAR_LEVELS } from '../adminData'
import { useToast } from '../../context/ToastContext'
import PageIntro from '../components/PageIntro'
import StudentSelector from '../components/StudentSelector'
import ViewOnlyNotice from '../components/ViewOnlyNotice'

const INITIAL_FORM = {
  name: '',
  yearLevel: '3rd Year',
  block: 'Block A',
  clinicalArea: '',
  instructor: '',
  status: 'Active',
  notes: '',
  memberIds: [],
}

export default function AdminGroupNewPage() {
  const { groups, students, canManage, saveGroup } = useAdmin()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Enter a group name.'
    if (!form.yearLevel) next.yearLevel = 'Select a year level.'
    if (!form.block.trim()) next.block = 'Enter a block or section.'
    if (!form.status) next.status = 'Select a group status.'
    if (
      form.name.trim() &&
      groups.some((group) => group.name.toLowerCase() === form.name.trim().toLowerCase())
    ) {
      next.name = 'A group with this name already exists.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canManage) return
    if (!validate()) {
      toast('Complete the required group details before saving.', 'danger')
      return
    }
    setSaving(true)
    try {
      const group = saveGroup(null, {
        ...form,
        name: form.name.trim(),
        block: form.block.trim(),
        clinicalArea: form.clinicalArea.trim(),
        instructor: form.instructor || 'Not assigned',
        notes: form.notes.trim(),
      })
      toast(
        `${group.name} created with ${group.memberIds.length} member${group.memberIds.length === 1 ? '' : 's'}.`,
        'success',
      )
      navigate(`/admin/groups/${group.id}`)
    } catch (error) {
      toast(error.message, 'danger')
      setSaving(false)
    }
  }

  return (
    <div className="adm-page">
      <Link to="/admin/groups" className="adm-back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to groups
      </Link>

      <PageIntro
        eyebrow="Create group"
        title="Set up a new RLE group"
        meta={
          <>
            <span className="adm-meta-pill"><strong>{students.length}</strong> students available</span>
            <span className="adm-meta-pill"><strong>{form.memberIds.length}</strong> selected</span>
          </>
        }
      />

      {!canManage && (
        <ViewOnlyNotice message="Creating groups is restricted to the RLE Coordinator." />
      )}

      <form className="adm-form-layout" onSubmit={handleSubmit} noValidate>
        <div className="adm-form-main">
          <section className="adm-card adm-form-card">
            <div className="adm-card__head">
              <div>
                <p className="adm-eyebrow">Group record</p>
                <h3>Group details</h3>
              </div>
            </div>

            <div className="adm-form-grid">
              <label className={`adm-field ${errors.name ? 'has-error' : ''}`}>
                <span>Group name *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="e.g. RLE Group 4"
                  disabled={!canManage}
                />
                {errors.name && <small className="adm-field__error">{errors.name}</small>}
              </label>

              <label className={`adm-field ${errors.yearLevel ? 'has-error' : ''}`}>
                <span>Year level *</span>
                <select
                  value={form.yearLevel}
                  onChange={(event) => update('yearLevel', event.target.value)}
                  disabled={!canManage}
                >
                  {YEAR_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.yearLevel && <small className="adm-field__error">{errors.yearLevel}</small>}
              </label>

              <label className={`adm-field ${errors.block ? 'has-error' : ''}`}>
                <span>Block / section *</span>
                <input
                  type="text"
                  value={form.block}
                  onChange={(event) => update('block', event.target.value)}
                  placeholder="e.g. Block A"
                  disabled={!canManage}
                />
                {errors.block && <small className="adm-field__error">{errors.block}</small>}
              </label>

              <label className="adm-field">
                <span>Clinical area</span>
                <input
                  type="text"
                  value={form.clinicalArea}
                  onChange={(event) => update('clinicalArea', event.target.value)}
                  placeholder="e.g. Community Health Nursing"
                  disabled={!canManage}
                />
              </label>

              <label className="adm-field">
                <span>Assigned clinical instructor</span>
                <select
                  value={form.instructor}
                  onChange={(event) => update('instructor', event.target.value)}
                  disabled={!canManage}
                >
                  <option value="">Not assigned</option>
                  {INSTRUCTORS.map((instructor) => (
                    <option key={instructor} value={instructor}>
                      {instructor}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`adm-field ${errors.status ? 'has-error' : ''}`}>
                <span>Group status *</span>
                <select
                  value={form.status}
                  onChange={(event) => update('status', event.target.value)}
                  disabled={!canManage}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {errors.status && <small className="adm-field__error">{errors.status}</small>}
              </label>

              <label className="adm-field adm-field--wide">
                <span>Notes</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) => update('notes', event.target.value)}
                  placeholder="Optional rotation notes or reminders"
                  disabled={!canManage}
                />
              </label>
            </div>

            <div className="adm-inline-note">
              <Info size={16} aria-hidden="true" />
              <p>
                A group can be created without members. Assign students now or from the group
                details page later. Students who already belong to another group will be moved.
              </p>
            </div>
          </section>

          <div className="adm-form-actions">
            <Link to="/admin/groups" className="adm-btn adm-btn--secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="adm-btn adm-btn--primary"
              disabled={!canManage || saving}
              title={!canManage ? 'Department Head access is view-only.' : undefined}
            >
              <Save size={16} aria-hidden="true" />
              {saving ? 'Creating…' : 'Create group'}
            </button>
          </div>
        </div>

        <aside className="adm-form-aside">
          <section className="adm-card adm-form-card">
            <div className="adm-card__head">
              <div>
                <p className="adm-eyebrow">Sequence step 2</p>
                <h3>Select students</h3>
              </div>
              <span className="adm-group-mark adm-group-mark--soft" aria-hidden="true">
                <UsersRound size={16} />
              </span>
            </div>
            <p className="adm-card__description">
            </p>
            <StudentSelector
              students={students}
              groups={groups}
              selectedIds={form.memberIds}
              onChange={(memberIds) => update('memberIds', memberIds)}
              disabled={!canManage}
            />
          </section>
        </aside>
      </form>
    </div>
  )
}
