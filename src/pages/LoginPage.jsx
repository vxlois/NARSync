<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
=======
>>>>>>> 91fe9f9 (Update login page and dashboard UI)
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NursingStudentsIllustration from '../components/NursingStudentsIllustration'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { DEMO_CREDENTIALS } from '../data/mockData'

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.4 5.4 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29A11.99 11.99 0 0 0 0 12c0 1.93.46 3.76 1.29 5.38l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useApp()
  const { toast } = useToast()
  const [studentId, setStudentId] = useState(DEMO_CREDENTIALS.studentId)
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const finishSignIn = (credentials, message) => {
    try {
      login(credentials)
      toast(message, 'success')
      navigate('/dashboard', { replace: true })
    } catch (loginError) {
      setError(loginError.message)
      setLoading(false)
      setGoogleLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!studentId.trim() || !password) {
      setError('Enter both your student ID and password to continue.')
      return
    }

    setLoading(true)
    timerRef.current = window.setTimeout(() => {
      finishSignIn({ studentId, password }, 'Signed in to your student account.')
    }, 850)
  }

  const handleGoogleSignIn = () => {
    setError('')
    setGoogleLoading(true)
    timerRef.current = window.setTimeout(() => {
      finishSignIn(
        {
          studentId: DEMO_CREDENTIALS.studentId,
          password: DEMO_CREDENTIALS.password,
        },
        'Signed in with Google.',
      )
    }, 850)
  }

  return (
    <div className="login">
      <section className="login__hero">
        <div className="login__top">
          <div className="login__brand">
            <div className="brand brand--light">
              <span className="brand__mark" aria-hidden="true">N</span>
              <span className="brand__text">
                <span className="brand__name">NARSync</span>
              </span>
            </div>
          </div>
        </div>

        <div className="login__illustration">
          <NursingStudentsIllustration />
        </div>
      </section>

      <section className="login__sheet">
        <div className="login__sheet-head">
          <h2>Welcome</h2>
          <p>Log in to continue to your attendance dashboard.</p>
        </div>

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
            disabled={googleLoading}
            iconRight={ArrowRight}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </Button>

          <Button
            type="button"
            variant="outline"
            block
            icon={GoogleIcon}
            loading={googleLoading}
            disabled={loading}
            onClick={handleGoogleSignIn}
          >
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </Button>
        </form>

<<<<<<< HEAD
        <p className="login__admin">
          <Link to="/admin">Open the Coordinator / Department Head dashboard</Link>
        </p>
=======
        <p className="login__footer">Bicol University Polangui</p>
>>>>>>> 91fe9f9 (Update login page and dashboard UI)
      </section>
    </div>
  )
}
