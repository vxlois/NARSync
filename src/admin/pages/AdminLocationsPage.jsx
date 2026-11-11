import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  ExternalLink,
  Info,
  LocateFixed,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
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
const RADIUS_PRESETS = [50, 100, 150, 200]

function LocationDrawer({ location, startInEdit = false, onClose }) {
  const { schedules, records, canManage, saveLocation } = useAdmin()
  const { toast } = useToast()
  const [editing, setEditing] = useState(startInEdit || !location)
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  const [geoStatus, setGeoStatus] = useState({ state: 'idle', message: '' })
  const [form, setForm] = useState({
    name: location?.name || '',
    address: location?.address || '',
    description: location?.description || '',
    contact: location?.contact || '',
    lat: location?.coords ? String(location.coords.lat) : '',
    lng: location?.coords ? String(location.coords.lng) : '',
    radius: location
      ? location.radius != null
        ? String(location.radius)
        : ''
      : '100',
    status: location?.status || 'Active',
  })

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    form.address.trim() || form.name.trim() || 'Bicol University Polangui',
  )}`

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus({
        state: 'error',
        message: 'Location is not available in this browser. Enter the coordinates manually.',
      })
      return
    }
    setLocating(true)
    setGeoStatus({ state: 'idle', message: '' })
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          lat: coords.latitude.toFixed(5),
          lng: coords.longitude.toFixed(5),
          radius: current.radius || '100',
        }))
        setLocating(false)
        setGeoStatus({ state: 'success', message: 'Coordinates captured from this device.' })
        setError('')
      },
      (positionError) => {
        setLocating(false)
        setGeoStatus({
          state: 'error',
          message:
            positionError.code === positionError.PERMISSION_DENIED
              ? 'Location access was blocked. Allow it in your browser, or enter the coordinates manually.'
              : "Couldn't get the current location. Try again, or enter the coordinates manually.",
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const clearCoordinates = () => {
    setForm((current) => ({ ...current, lat: '', lng: '' }))
    setGeoStatus({ state: 'idle', message: '' })
    setError('')
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.address.trim()) {
      setError('Name and address are required.')
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
      setError('Radius must be a positive number.')
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
    toast(location ? 'Location updated.' : 'Location added.', 'success')
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
      title={editing ? (location ? 'Edit location' : 'Add location') : location?.name}
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
              Save
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
              Edit
            </button>
          </>
        )
      }
    >
      {!canManage && (
        <ViewOnlyNotice message="View only. Location details can't be changed." />
      )}

      {editing ? (
        <div className="adm-form-grid">
          <label className="adm-field">
            <span>Name *</span>
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
            <span>Address *</span>
            <input value={form.address} onChange={(event) => update('address', event.target.value)} disabled={!canManage} />
          </label>
          <label className="adm-field adm-field--wide">
            <span>Notes</span>
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
          <div className="adm-field">
            <span>Check-in radius (m)</span>
            <div className="adm-radius-presets" role="group" aria-label="Radius presets">
              {RADIUS_PRESETS.map((preset) => {
                const active = Number(form.radius) === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    className={`adm-radius-preset ${active ? 'is-active' : ''}`}
                    onClick={() => update('radius', String(preset))}
                    disabled={!canManage}
                    aria-pressed={active}
                  >
                    {preset} m
                  </button>
                )
              })}
            </div>
            <input
              type="number"
              min="1"
              value={form.radius}
              onChange={(event) => update('radius', event.target.value)}
              placeholder="Custom"
              aria-label="Check-in radius in meters"
              disabled={!canManage}
            />
            <small className="adm-field__hint">100 m is a good default.</small>
          </div>
          <div className="adm-location-pin adm-field--wide">
            <div className="adm-location-pin__head">
              <span>
                <strong>GPS pin</strong>
                <small>Optional. Needed for geofence checks.</small>
              </span>
              <span className="adm-location-pin__actions">
                {form.lat && form.lng && (
                  <button
                    type="button"
                    className="adm-text-btn"
                    onClick={clearCoordinates}
                    disabled={!canManage}
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  className="adm-btn adm-btn--secondary"
                  onClick={useCurrentLocation}
                  disabled={!canManage || locating}
                >
                  <LocateFixed size={15} aria-hidden="true" />
                  {locating ? 'Locating…' : 'Use current location'}
                </button>
              </span>
            </div>

            <div className="adm-location-pin__fields">
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

            <p className="adm-location-pin__hint">
              <Info size={13} aria-hidden="true" />
              <span>
                Not sure?{' '}
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  Open the address in Google Maps
                  <ExternalLink size={11} aria-hidden="true" />
                </a>{' '}
                and right-click the pin to copy its coordinates.
              </span>
            </p>

            {geoStatus.message && (
              <p className={`adm-location-pin__status is-${geoStatus.state}`}>
                {geoStatus.message}
              </p>
            )}
          </div>
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

          {location.coords && location.radius ? (
            <div className="adm-location-map" aria-label="Location map preview">
              <span className="adm-location-map__pin" aria-hidden="true">
                <MapPin size={22} />
              </span>
              <span className="adm-location-map__ring" aria-hidden="true" />
              <div>
                <strong>{formatCoords(location.coords)}</strong>
                <span>{location.radius} m radius</span>
              </div>
            </div>
          ) : (
            <div className="adm-location-setup" role="note">
              <span className="adm-location-setup__icon" aria-hidden="true">
                <Info size={17} />
              </span>
              <div>
                <strong>Geofence not set up</strong>
                <p>Add a GPS pin and check-in radius to verify student check-ins here.</p>
              </div>
              {canManage && (
                <button
                  type="button"
                  className="adm-btn adm-btn--secondary"
                  onClick={() => setEditing(true)}
                >
                  Set up
                </button>
              )}
            </div>
          )}

          <div className="adm-detail-list">
            <div>
              <span>Notes</span>
              <strong>{location.description || 'No notes.'}</strong>
            </div>
            <div>
              <span>Contact</span>
              <strong>{location.contact || '—'}</strong>
            </div>
            <div>
              <span>Schedules</span>
              <strong>{scheduleCount}</strong>
            </div>
            <div>
              <span>Records</span>
              <strong>{recordCount}</strong>
            </div>
          </div>
        </div>
      )}

      {error && <p className="adm-form-error">{error}</p>}
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
  const inactiveCount = locations.length - activeCount

  const resetFilters = () => {
    setSearch('')
    setStatus('all')
  }

  const applyQuickFilter = (filter) => {
    setSearch('')
    setStatus(filter === 'active' ? 'Active' : filter === 'inactive' ? 'Inactive' : 'all')
  }

  const quickFilters = [
    { key: 'all', label: 'All', count: locations.length },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'inactive', label: 'Inactive', count: inactiveCount },
  ]

  const activeQuickFilter =
    status === 'Active'
      ? 'active'
      : status === 'Inactive'
        ? 'inactive'
        : !search.trim()
          ? 'all'
          : ''

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
        <ViewOnlyNotice message="View only. Locations can't be changed." />
      )}

      <section className="adm-filter-card" aria-label="Location filters">
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
        <div className="adm-filters">
          <label className="adm-search-field">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or address"
              aria-label="Search locations"
            />
          </label>
          <label className="adm-field adm-field--inline">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
      </section>

      <section className="adm-card adm-card--table">
        <div className="adm-table-head">
          <div>
            <h3>Locations</h3>
            <p>{filteredLocations.length} shown</p>
          </div>
          <span className="adm-table-head__page">
            Page {page} of {Math.max(1, Math.ceil(filteredLocations.length / PAGE_SIZE))}
          </span>
        </div>

        {pageLocations.length ? (
          <>
            <div className="adm-table-wrap">
              <table className="adm-table adm-table--fit">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Radius</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLocations.map((location) => (
                    <tr
                      key={location.id}
                      className="adm-table__row--clickable"
                      onClick={() => openDetails(location)}
                    >
                      <td>
                        <div className="adm-person">
                          <span className="adm-location-mark" aria-hidden="true">
                            <MapPin size={16} />
                          </span>
                          <div>
                            <button
                              type="button"
                              className="adm-table-link"
                              onClick={(event) => {
                                event.stopPropagation()
                                openDetails(location)
                              }}
                            >
                              {location.name}
                            </button>
                            <span>{location.address}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {location.radius ? (
                          <span className="adm-radius-cell">
                            <span className="adm-radius-ring" aria-hidden="true" />
                            {location.radius} m
                          </span>
                        ) : (
                          <span className="adm-muted">Not set</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge tone={location.status === 'Active' ? 'success' : 'neutral'} dot>
                          {location.status}
                        </StatusBadge>
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
            title="No locations"
            description={
              locations.length
                ? 'Adjust the filters to see more.'
                : 'Add a location to get started.'
            }
            action={
              locations.length ? (
                <button type="button" className="adm-btn adm-btn--secondary" onClick={resetFilters}>
                  Clear filters
                </button>
              ) : canManage ? (
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
