import {
  CalendarDays,
  Clock3,
  MapPin,
  ScanFace,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DemoNotice from '../components/DemoNotice'
import PageHeader from '../components/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useApp } from '../context/AppContext'
import { formatDateLong } from '../utils/format'

export default function DutyDetailsPage() {
  const navigate = useNavigate()
  const { student } = useApp()
  const { duty, group } = student

  return (
    <div className="screen">
      <PageHeader
        title="Duty assignment"
        eyebrow="RLE placement"
        backTo="/dashboard"
        backLabel="Back to dashboard"
      />

      <DemoNotice>
        Your RLE group and clinical area are assigned by the RLE Coordinator. Students
        cannot create groups or choose a different duty location in this app.
      </DemoNotice>

      <section className="assignment-hero">
        <div className="assignment-hero__top">
          <span className="assignment-hero__icon" aria-hidden="true">
            <Stethoscope size={22} />
          </span>
          <Badge tone="violet">{group.name}</Badge>
        </div>
        <p className="eyebrow" style={{ marginTop: 12 }}>
          Community Health Nursing
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
          <div className="detail-row">
            <span className="detail-row__icon" aria-hidden="true">
              <Users size={17} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">RLE group</span>
              <span className="detail-row__value">
                {group.name} · {group.members} student nurses
              </span>
              <span className="detail-row__sub">Group code {group.code}</span>
            </div>
          </div>
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
              <span className="detail-row__label">Clinical preceptor</span>
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
            Time in and time out using a clear group photo with your assigned group.
          </li>
          <li>
            <span className="guideline-list__num" aria-hidden="true">3</span>
            Review the timestamp and simulated location before confirming each submission.
          </li>
        </ol>
      </Card>

      <Button
        variant="secondary"
        block
        icon={ScanFace}
        onClick={() => navigate('/face-registration')}
      >
        Open facial registration
      </Button>
    </div>
  )
}
