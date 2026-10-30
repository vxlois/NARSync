import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import { useToast } from '../../context/ToastContext'
import { formatCoords } from '../../utils/format'
import Drawer from '../components/Drawer'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import ViewOnlyNotice from '../components/ViewOnlyNotice'

const PAGE_SIZE = 8

function LocationDrawer({ location, startInEdit = false, onClose }) {
  const { schedules, records, canManage, saveLocation } = useAdmin()
  const { toast } = useToast()
  const [editing, setEditing] = useState(startInEdit || !location)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: location?.name || '',
    address: location?.address || '',
    description: location?.description || '',
    contact: location?.contact || '',
    lat: location?.coords ? String(location.coords.lat) : '',
    lng: location?.coords ? String(location.coords.lng) : '',
    radius: location?.radius != null ? String(location.radius) : '',
    status: location?.status || 'Active',
  })

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.address.trim()) {
      setError('Location name and address are required.')
      return
    }
    if ((form.lat && !form.lng) || (!form.lat && form.lng)) {
      setError('Enter both latitude and longitude, or leave both blank.')
      return
    }
    const lat = form.lat ? Number(form.lat) : null
    const lng = form.lng ? Number(form.lng) : null
    if (lat != null && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
      setError('Latitude must be a number between -90 and 90.')
      return
    }
    if (lng != null && (Number.isNaN(lng) || lng < -180 || lng > 180)) {
      setError('Longitude must be a number between -180 and 180.')
      return
    }
    if (form.radius && (Number.isNaN(Number(form.radius)) || Number(form.radius) <= 0)) {
      setError('Verification radius must be a positive number of meters.')
      return
    }

    saveLocation(location?.id, {
      name: form.name.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
      contact: form.contact.trim(),
      coords: lat != null ? { lat, lng } : null,
      radius: form.radius ? Number(form.radius) : null,
      status: form.status,
    })
    toast(location ? 'Clinical location updated.' : 'Clinical location added.', 'success')
    onClose()
  }

  const scheduleCount = location
    ? schedules.filter((schedule) => schedule.locationId === location.id).length
    : 0
  const recordCount = location
    ? records.filter((record) => record.locationId === location.id).length
    : 0

  return (
    <Drawer
      open
      title={editing ? (location ? 'Edit clinical location' : 'Add clinical location') : location?.name}
      subtitle={editing ? 'Synthetic coordinates and geofence settings for the prototype.' : location?.address}
      onClose={onClose}
      size="lg"
      footer={
        editing ? (
          <>
            <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--primary"
              onClick={handleSave}
              disabled={!canManage}
              title={!canManage ? 'Department Head access is view-only.' : undefined}
            >
              Save location
            </button>
          </>
        ) : (
          <>
            <button type="button" className="adm-btn adm-btn--secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--primary"
              onClick={() => setEditing(true)}
              disabled={!canManage}
              title={!canManage ? 'Department Head access is view-only.' : undefined}
            >
              <Pencil size={16} aria-hidden="true" />
              Edit location
            </button>
          </>
        )
      }
    >
      {!canManage && (
        <ViewOnlyNotice message="Clinical location details can be viewed, but editing is restricted to the RLE Coordinator." />
      )}

      {editing ? (
        <div className="adm-form-grid">
          <label className="adm-field">
            <span>Location name *</span>
            <input value={form.name} onChange={(event) => update('name', event.target.value)} disabled={!canManage} />
          </label>
          <label className="adm-field">
            <span>Status</span>
            <select value={form.status} onChange={(event) => update('status', event.target.value)} disabled={!canManage}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          <label className="adm-field adm-field--wide">
            <span>Address or location description *</span>
            <input value={form.address} onChange={(event) => update('address', event.target.value)} disabled={!canManage} />
          </label>
          <label className="adm-field adm-field--wide">
            <span>Site notes</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              disabled={!canManage}
            />
          </label>
          <label className="adm-field">
            <span>Contact</span>
            <input value={form.contact} onChange={(event) => update('contact', event.target.value)} disabled={!canManage} />
          </label>
          <label className="adm-field">
            <span>Verification radius (meters)</span>
            <input
              type="number"
              min="1"
              value={form.radius}
              onChange={(event) => update('radius', event.target.value)}
              placeholder="e.g. 120"
              disabled={!canManage}
            />
          </label>
          <label className="adm-field">
            <span>Latitude</span>
            <input
              type="number"
              step="0.0001"
              value={form.lat}
              onChange={(event) => update('lat', event.target.value)}
              placeholder="e.g. 13.2918"
              disabled={!canManage}
            />
          </label>
          <label className="adm-field">
            <span>Longitude</span>
            <input
              type="number"
              step="0.0001"
              value={form.lng}
              onChange={(event) => update('lng', event.target.value)}
              placeholder="e.g. 123.4856"
              disabled={!canManage}
            />
          </label>
        </div>
      ) : (
        <div className="adm-location-view">
          <div className="adm-location-hero">
            <span className="adm-location-hero__icon" aria-hidden="true">
              <MapPin size={24} />
            </span>
            <div>
              <h3>{location.name}</h3>
              <p>{location.address}</p>
            </div>
            <StatusBadge tone={location.status === 'Active' ? 'success' : 'neutral'} dot>
              {location.status}
            </StatusBadge>
          </div>

          <div className="adm-location-map" aria-label="Synthetic location map preview">
            <span className="adm-location-map__pin" aria-hidden="true">
              <MapPin size={22} />
            </span>
            <span className="adm-location-map__ring" aria-hidden="true" />
            <div>
              <strong>{location.coords ? formatCoords(location.coords) : 'Coordinates not configured'}</strong>
              <span>{location.radius ? `${location.radius} m verification radius` : 'Geofence not configured'}</span>
            </div>
          </div>

          <div className="adm-detail-list">
            <div>
              <span>Site notes</span>
              <strong>{location.description || 'No site notes recorded.'}</strong>
            </div>
            <div>
              <span>Contact</span>
              <strong>{location.contact || 'Not provided'}</strong>
            </div>
            <div>
              <span>Assigned schedules</span>
              <strong>{scheduleCount}</strong>
            </div>
            <div>
              <span>Attendance records</span>
              <strong>{recordCount}</strong>
            </div>
          </div>

          <div className="adm-inline-note">
            <ShieldCheck size={16} aria-hidden="true" />
            <p>
              Coordinates and geofence values are synthetic. They demonstrate how location
              verification settings appear to coordinators and department heads.
            </p>
          </div>
        </div>
      )}

      {error && <p className="adm-form-error">{error}</p>}
      {editing && (
        <p className="adm-fineprint">
          Coordinates are optional. When present, they are used with the verification radius to
          describe the prototype geofence.
        </p>
      )}
    </Drawer>
  )
}

export default function AdminLocationsPage() {
  const { locations, canManage } = useAdmin()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [startInEdit, setStartInEdit] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [search, status])

  const filteredLocations = useMemo(() => {
    const term = search.trim().toLowerCase()
    return locations.filter((location) => {
      if (status !== 'all' && location.status !== status) return false
      if (!term) return true
      return [location.name, location.address, location.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [locations, search, status])

  const pageLocations = filteredLocations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const selectedLocation = locations.find((location) => location.id === selectedId) || null
  const activeCount = locations.filter((location) => location.status === 'Active').length
  const geofencedCount = locations.filter((location) => location.coords && location.radius).length

  const openDetails = (location) => {
    setSelectedId(location.id)
    setStartInEdit(false)
    setDrawerOpen(true)
  }

  const openCreate = () => {
    setSelectedId(null)
    setStartInEdit(true)
    setDrawerOpen(true)
  }

  return (
    <div className="adm-page">
      <PageIntro
        eyebrow="Clinical sites"
        title="Clinical location management"
        meta={
          <>
            <span className="adm-meta-pill"><strong>{locations.length}</strong> locations</span>
            <span className="adm-meta-pill"><strong>{activeCount}</strong> active</span>
            <span className="adm-meta-pill"><strong>{geofencedCount}</strong> geofenced</span>
          </>
        }
        actions={
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={openCreate}
            disabled={!canManage}
            title={!canManage ? 'Department Head access is view-only.' : undefined}
          >
            <Plus size={16} aria-hidden="true" />
            Add location
          </button>
        }
      />

      {!canManage && (
        <ViewOnlyNotice message="Clinical locations can be reviewed, but adding or editing locations is restricted to the RLE Coordinator." />
      )}

      <div className="adm-inline-note">
        <Navigation size={16} aria-hidden="true" />
        <p>
          All addresses and coordinates are synthetic prototype data. No live GPS or map service is
          used in this interface.
        </p>
      </div>

      <section className="adm-filter-card" aria-label="Location filters">
        <div className="adm-filter-card__head">
          <span>
            <SlidersHorizontal size={15} aria-hidden="true" />
            Search and filters
          </span>
          <button
            type="button"
            className="adm-text-btn"
            onClick={() => {
              setSearch('')
              setStatus('all')
            }}
          >
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
              placeholder="Search location name or address"
              aria-label="Search clinical locations"
            />
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
            <h3>Registered clinical locations</h3>
            <p>{filteredLocations.length} locations match the current filters.</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filteredLocations.length / PAGE_SIZE))}
          </span>
        </div>

        {pageLocations.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Address or description</th>
                    <th>Coordinates</th>
                    <th>Verification radius</th>
                    <th>Status</th>
                    <th className="adm-table__action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLocations.map((location) => (
                    <tr key={location.id}>
                      <td>
                        <div className="adm-person">
                          <span className="adm-location-mark" aria-hidden="true">
                            <MapPin size={16} />
                          </span>
                          <div>
                            <button
                              type="button"
                              className="adm-table-link"
                              onClick={() => openDetails(location)}
                            >
                              {location.name}
                            </button>
                            <span>{location.contact || 'No contact recorded'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="adm-address-cell">{location.address}</span>
                      </td>
                      <td className="adm-mono">
                        {location.coords ? formatCoords(location.coords) : <span className="adm-muted">Not set</span>}
                      </td>
                      <td>
                        {location.radius ? (
                          <span className="adm-radius-cell">
                            <span className="adm-radius-ring" aria-hidden="true" />
                            {location.radius} m
                          </span>
                        ) : (
                          <span className="adm-muted">Not configured</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge tone={location.status === 'Active' ? 'success' : 'neutral'} dot>
                          {location.status}
                        </StatusBadge>
                      </td>
                      <td className="adm-table__action">
                        <button type="button" className="adm-text-btn" onClick={() => openDetails(location)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filteredLocations.length}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState
            icon={Building2}
            title="No clinical locations found"
            description="Adjust the search or filters to find a registered location."
            action={
              canManage ? (
                <button type="button" className="adm-btn adm-btn--primary" onClick={openCreate}>
                  <Plus size={16} aria-hidden="true" />
                  Add location
                </button>
              ) : null
            }
          />
        )}
      </section>

      {drawerOpen && (
        <LocationDrawer
          location={selectedLocation}
          startInEdit={startInEdit}
          onClose={() => {
            setDrawerOpen(false)
            setSelectedId(null)
            setStartInEdit(false)
          }}
        />
      )}
    </div>
  )
}
