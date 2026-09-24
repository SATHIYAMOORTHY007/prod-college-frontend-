import { Outlet } from 'react-router-dom'
import { ClipboardCheck, GraduationCap, ShieldCheck, BarChart3 } from 'lucide-react'

const FEATURES = [
  { icon: ShieldCheck, title: 'Role-based access', text: 'Admins, principals, examiners and students each see exactly what they need.' },
  { icon: ClipboardCheck, title: 'Result approval workflow', text: 'Marks move from draft to published with a full audit trail.' },
  { icon: BarChart3, title: 'Live academic insights', text: 'Attendance and pass rates computed on the server, in real time.' },
]

function AuthLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="d-flex align-items-center gap-2">
          <span className="brand-mark">
            <GraduationCap size={20} />
          </span>
          <span className="fw-bold text-white">College Portal</span>
        </div>

        <div>
          <h1>Everything your campus runs on, in one place.</h1>
          <p className="mt-3">Attendance, exams and results for ABC College of Engineering — from marks entry to publication.</p>
          <div className="mt-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="auth-feature">
                <span className="auth-feature-icon">
                  <Icon size={17} />
                </span>
                <div>
                  <div className="fw-semibold text-white">{title}</div>
                  <div className="small" style={{ color: '#c7d2fe' }}>
                    {text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="small" style={{ color: '#a5b4fc' }}>
          © {new Date().getFullYear()} ABC College of Engineering
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default AuthLayout
