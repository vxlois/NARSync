import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import DemoNotice from '../components/DemoNotice'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import { DEMO_CREDENTIALS } from '../data/mockData'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useApp()
  const { toast } = useToast()
  const [studentId, setStudentId] = useState(DEMO_CREDENTIALS.studentId)
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!studentId.trim() || !password) {
      setError('Enter both your student ID and password to continue.')
      return
    }

    setLoading(true)
    timerRef.current = window.setTimeout(() => {
      try {
        login({ studentId, password })
        toast('Signed in to the prototype student account.', 'success')
        navigate('/dashboard', { replace: true })
      } catch (loginError) {
        setError(loginError.message)
        setLoading(false)
      }
    }, 850)
  }

  return (
    <div className="login">
      <section className="login__hero">
        <div className="login__top">
          <div className="brand brand--light">
            <span className="brand__mark" aria-hidden="true">N</span>
            <span className="brand__text">
              <span className="brand__name">NARSync</span>
              <span className="brand__sub">RLE attendance</span>
            </span>
          </div>
          <span className="login__tag">Student app</span>
        </div>

        <div className="login__hero-copy">
          <h1>Attendance, in sync with your duty.</h1>
          <p>
            A centralized way to monitor your Related Learning Experience attendance at
            Bicol University Polangui.
          </p>
        </div>

        <p className="login__school">
          <GraduationCap size={14} aria-hidden="true" />
          College of Nursing and Health Sciences
        </p>
      </section>

      <section className="login__sheet">
        <div className="login__sheet-head">
          <h2>Student sign in</h2>
          <p>Use the demo credentials to explore the prototype.</p>
        </div>

        <DemoNotice>
          <strong>Prototype authentication.</strong> Sign in is simulated and no real
          student account is verified. These credentials are prefilled for the demo.
          <div className="demo-creds">
            <div>
              <span>Student ID</span>
              <strong>{DEMO_CREDENTIALS.studentId}</strong>
            </div>
            <div>
              <span>Password</span>
              <strong>{DEMO_CREDENTIALS.password}</strong>
            </div>
          </div>
        </DemoNotice>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="student-id"
            label="Student ID"
            icon={UserRound}
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            placeholder="Enter student ID"
            autoComplete="username"
            inputMode="text"
          />

          <TextField
            id="password"
            label="Password"
            icon={LockKeyhole}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            error={error}
            right={
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />

          <Button
            type="submit"
            block
            loading={loading}
            iconRight={ArrowRight}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="login__footer">
            <ShieldCheck size={12} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Prototype build · Fictional student data · No server connection
          </p>
        </form>
      </section>
    </div>
  )
}
