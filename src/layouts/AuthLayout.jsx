import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft, Bell, Check, GraduationCap, Lock } from 'lucide-react'
import { ROUTES } from '../constants/routes'
import { StatusBadge } from '../components/ui'

const ROLES = ['Administrators', 'Principals', 'Examiners', 'Students']

/** Decorative preview of the portal (sample data), hidden from assistive tech. */
function AuthVisual() {
  return (
    <div className="auth-visual" aria-hidden="true">
      <div className="auth-float auth-float-main">
        <div className="auth-float-head">
          <div>
            <strong>CSE Sem 5 — Internal Assessment 1</strong>
            <span>24CSE118 · B.E. Computer Science</span>
          </div>
          <StatusBadge status="APPROVED" />
        </div>
        {[
          ['CS501', 'Operating Systems', 78],
          ['CS502', 'Computer Networks', 84],
          ['CS503', 'Software Engineering', 71],
        ].map(([code, name, score]) => (
          <div key={code} className="auth-float-row">
            <span>
              <em>{code}</em> {name}
            </span>
            <b>{score}</b>
          </div>
        ))}
        <div className="auth-float-row is-total">
          <span>Total</span>
          <b>233 / 300</b>
        </div>
      </div>

      <div className="auth-float auth-float-toast">
        <span className="auth-float-icon">
          <Bell size={14} />
        </span>
        <span>
          <strong>Result published</strong>
          <span>The student has been notified.</span>
        </span>
      </div>

      <div className="auth-float auth-float-ring">
        <span className="auth-ring" style={{ '--v': 86 }}>
          <span>86%</span>
        </span>
        <span>
          <strong>Attendance</strong>
          <span>All recorded classes</span>
        </span>
      </div>
    </div>
  )
}

function AuthLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <Link to={ROUTES.HOME} className="auth-brand">
          <span className="brand-mark">
            <GraduationCap size={18} />
          </span>
          College Portal
        </Link>

        <div className="auth-hero-body">
          <p className="auth-eyebrow">ABC College of Engineering</p>
          <h1>One sign-in for every academic workflow.</h1>
          <p className="auth-hero-lead">Marks, attendance, approvals and results — in the workspace your role needs.</p>
          <AuthVisual />
        </div>

        <div className="auth-hero-foot">
          <ul className="auth-roles">
            {ROLES.map((role) => (
              <li key={role}>
                <Check size={13} aria-hidden="true" /> {role}
              </li>
            ))}
          </ul>
          <span>© {new Date().getFullYear()} ABC College of Engineering</span>
        </div>
      </section>

      <main className="auth-panel">
        <div className="auth-topbar">
          <Link to={ROUTES.HOME} className="auth-back">
            <ArrowLeft size={15} aria-hidden="true" /> Back to home
          </Link>
          <Link to={ROUTES.HOME} className="auth-brand auth-brand-compact" aria-label="College Portal home">
            <span className="brand-mark">
              <GraduationCap size={16} />
            </span>
            College Portal
          </Link>
        </div>

        <div className="auth-card">
          <Outlet />
        </div>

        <p className="auth-secure">
          <Lock size={13} aria-hidden="true" /> Secure sign-in · Access is limited to college-issued accounts
        </p>
      </main>
    </div>
  )
}

export default AuthLayout
