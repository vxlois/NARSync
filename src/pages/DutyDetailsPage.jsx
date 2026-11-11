import { useState } from 'react'
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Sheet from '../components/ui/Sheet'
import { useApp } from '../context/AppContext'
import { formatDateLong } from '../utils/format'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function DutyDetailsPage() {
  const navigate = useNavigate()
  const { student } = useApp()
  const { duty, group } = student
  const [groupOpen, setGroupOpen] = useState(false)
  const groupMembers = group.memberNames ?? []

  return (
    <div className="screen">
      <PageHeader
        title="Duty assignment"
        eyebrow="RLE placement"
        backTo="/dashboard"
        backLabel="Back to dashboard"
      />

      <section className="assignment-hero">
        <div className="assignment-hero__top">
          <span className="assignment-hero__icon" aria-hidden="true">
            <Stethoscope size={22} />
          </span>
          <Badge tone="violet">{group.name}</Badge>
        </div>
        <p className="eyebrow" style={{ marginTop: 12 }}>
          {duty.clinicalArea}
        </p>
        <h2>{duty.facility}</h2>
        <p className="assignment-hero__address">
          <MapPin size={14} aria-hidden="true" />
          {duty.address}
        </p>
      </section>

      <Card>
        <h2 className="section__title" style={{ marginBottom: 6 }}>
          Assignment details
        </h2>
        <div className="detail-list">
          <button
            type="button"
            className="detail-row detail-row--action"
            onClick={() => setGroupOpen(true)}
            aria-label={`View the members of ${group.name}`}
          >
            <span className="detail-row__icon" aria-hidden="true">
              <Users size={17} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">RLE group</span>
              <span className="detail-row__value">{group.name}</span>
              <span className="detail-row__sub">Tap to view members</span>
            </div>
            <ChevronRight className="detail-row__chevron" size={18} aria-hidden="true" />
          </button>
          <div className="detail-row">
            <span className="detail-row__icon" aria-hidden="true">
              <CalendarDays size={17} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">Duty date</span>
              <span className="detail-row__value">{formatDateLong(duty.date)}</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-row__icon" aria-hidden="true">
              <Clock3 size={17} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">Duty schedule</span>
              <span className="detail-row__value">{duty.shift}</span>
              <span className="detail-row__sub">Call time is {duty.callTime}</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-row__icon" aria-hidden="true">
              <UserCheck size={17} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">RLE coordinator</span>
              <span className="detail-row__value">{duty.coordinator}</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-row__icon" aria-hidden="true">
              <UserCheck size={17} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">Clinical Instructor</span>
              <span className="detail-row__value">{duty.preceptor}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="section__title" style={{ marginBottom: 10 }}>
          Duty reminders
        </h2>
        <ol className="guideline-list">
          <li>
            <span className="guideline-list__num" aria-hidden="true">1</span>
            Arrive at {duty.facility} by {duty.callTime} for endorsement.
          </li>
          <li>
            <span className="guideline-list__num" aria-hidden="true">2</span>
            Time in and time out using your own photo, verified against your registered facial data.
          </li>
          <li>
            <span className="guideline-list__num" aria-hidden="true">3</span>
            Review the timestamp and location before confirming each submission.
          </li>
        </ol>
      </Card>

      <Button
        variant="secondary"
        block
        icon={Clock3}
        onClick={() => navigate('/attendance')}
      >
        Open Today&apos;s Attendance
      </Button>

      <Sheet
        open={groupOpen}
        onClose={() => setGroupOpen(false)}
        title="Group members"
        icon={Users}
        tone="violet"
      >
        <ul className="group-members__list">
          {groupMembers.map((member) => (
            <li className="group-members__item" key={member}>
              <span className="group-members__avatar" aria-hidden="true">
                {initials(member)}
              </span>
              <span className="group-members__name">
                {member}
                {member === student.name ? ' (You)' : ''}
              </span>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  )
}
