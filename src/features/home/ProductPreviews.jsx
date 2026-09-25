import { useRef, useState } from 'react'
import { Check, ClipboardCheck, GraduationCap, UserCheck, UserCog } from 'lucide-react'
import { StatusBadge } from '../../components/ui'

/*
 * Static mock-ups of the real portal screens (see features/dashboard and
 * features/results). The figures are one consistent sample college,
 * labelled as sample data, and never fetched: the public page exposes no
 * real records.
 */

const PIPELINE = [
  { status: 'DRAFT', label: 'Draft', value: 42, color: '#94a3b8' },
  { status: 'SUBMITTED', label: 'Submitted', value: 18, color: '#f59e0b' },
  { status: 'APPROVED', label: 'Approved', value: 36, color: '#0ea5e9' },
  { status: 'PUBLISHED', label: 'Published', value: 124, color: '#10b981' },
]

export function MiniKpi({ icon: Icon, tone, label, value }) {
  return (
    <div className="pv-kpi">
      <span className={`pv-kpi-icon tone-${tone}`} aria-hidden="true">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <div className="pv-kpi-label">{label}</div>
        <div className="pv-kpi-value tabular">{value}</div>
      </div>
    </div>
  )
}

export function Panel({ title, subtitle, children }) {
  return (
    <div className="pv-panel">
      <div className="pv-panel-title">{title}</div>
      {subtitle && <div className="pv-panel-sub">{subtitle}</div>}
      {children}
    </div>
  )
}

/** Horizontal bars; `max` sets the scale, `target` draws a threshold marker. */
export function BarList({ rows, max = 100, unit = '' }) {
  return (
    <ul className="pv-bars">
      {rows.map((row, index) => (
        <li key={row.label} style={{ '--i': index }}>
          <span className="pv-bar-label">{row.label}</span>
          <span className="pv-bar-track">
            <span className="pv-bar-fill" style={{ width: `${(row.value / max) * 100}%`, background: row.color ?? 'var(--cp-primary)' }} />
            {row.target != null && <span className="pv-bar-target" style={{ left: `${(row.target / max) * 100}%` }} />}
          </span>
          <span className="pv-bar-value tabular">{row.display ?? `${row.value}${unit}`}</span>
        </li>
      ))}
    </ul>
  )
}

export function Pipeline() {
  const total = PIPELINE.reduce((sum, stage) => sum + stage.value, 0)
  return (
    <>
      <div className="pv-stack" aria-hidden="true">
        {PIPELINE.map((stage) => (
          <span key={stage.status} style={{ width: `${(stage.value / total) * 100}%`, background: stage.color }} />
        ))}
      </div>
      <ul className="pv-legend">
        {PIPELINE.map((stage) => (
          <li key={stage.status}>
            <span className="pv-dot" style={{ background: stage.color }} />
            {stage.label}
            <strong className="tabular">{stage.value}</strong>
          </li>
        ))}
      </ul>
    </>
  )
}

function WindowChrome({ label }) {
  return (
    <div className="pv-chrome" aria-hidden="true">
      <span />
      <span />
      <span />
      <div className="pv-url">{label}</div>
    </div>
  )
}

/* ------------------------------------------------------- Role workspaces */

const ROLE_VIEWS = [
  {
    id: 'admin',
    icon: UserCog,
    tone: 'rose',
    label: 'Admin',
    headline: 'Runs the system.',
    text: 'Sets up the college and keeps it running.',
    can: ['Create staff accounts and enrol students', 'Manage departments, courses and subjects', 'Step in for an absent examiner or principal'],
    panels: [
      {
        title: 'Students by department',
        subtitle: 'Active enrolments',
        body: (
          <BarList
            max={200}
            rows={[
              { label: 'CSE', value: 186 },
              { label: 'ECE', value: 142 },
              { label: 'MECH', value: 118 },
            ]}
          />
        ),
      },
      {
        title: 'Upcoming exams',
        subtitle: 'Across all departments',
        body: (
          <ul className="pv-list">
            <li>
              <span>CSE Sem 3 — Internal Assessment 2</span>
              <StatusBadge status="INTERNAL" />
            </li>
            <li>
              <span>MECH Sem 3 — Thermal Lab</span>
              <StatusBadge status="PRACTICAL" />
            </li>
            <li>
              <span>ECE Sem 3 — End Semester</span>
              <StatusBadge status="SEMESTER" />
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: 'principal',
    icon: UserCheck,
    tone: 'indigo',
    label: 'Principal',
    headline: 'Decides what is released.',
    text: 'Oversees academic performance and owns the final say on results.',
    can: ['Approve or send back submitted results', 'Publish approved results in bulk', 'Review the audit log'],
    panels: [
      {
        title: 'Awaiting your review',
        subtitle: 'CSE Sem 5 — Internal Assessment 1',
        body: (
          <ul className="pv-list">
            <li>
              <span>24CSE118 · 233 / 300</span>
              <StatusBadge status="SUBMITTED" />
            </li>
            <li>
              <span>24CSE119 · 246 / 300</span>
              <StatusBadge status="SUBMITTED" />
            </li>
            <li>
              <span>24CSE120 · 219 / 300</span>
              <StatusBadge status="SUBMITTED" />
            </li>
          </ul>
        ),
      },
      {
        title: 'Selected: 3 results',
        subtitle: 'Bulk actions',
        body: (
          <div className="pv-actions">
            <span className="pv-fake-btn is-primary">Approve selected</span>
            <span className="pv-fake-btn">Send back</span>
          </div>
        ),
      },
    ],
  },
  {
    id: 'examiner',
    icon: ClipboardCheck,
    tone: 'sky',
    label: 'Examiner',
    headline: 'Records the marks.',
    text: 'Works only on the exams assigned to them.',
    can: ['Enter marks for assigned exams', 'Take attendance by subject', 'Submit results for approval'],
    panels: [
      {
        title: 'Marks entry progress',
        subtitle: 'Students with marks vs. enrolled',
        body: (
          <BarList
            max={64}
            rows={[
              { label: 'CSE S3 IA 1', value: 62, display: '62 / 62', color: '#10b981' },
              { label: 'CSE S5 IA 1', value: 52, display: '52 / 64' },
              { label: 'CSE S3 IA 2', value: 0, display: '0 / 62' },
            ]}
          />
        ),
      },
      {
        title: 'My results',
        subtitle: 'By workflow stage',
        body: (
          <ul className="pv-list">
            <li>
              <span>Drafts</span>
              <strong className="tabular">9</strong>
            </li>
            <li>
              <span>Awaiting approval</span>
              <strong className="tabular">18</strong>
            </li>
            <li>
              <span>Students without marks</span>
              <strong className="tabular">12</strong>
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: 'student',
    icon: GraduationCap,
    tone: 'green',
    label: 'Student',
    headline: 'Sees their own record.',
    text: 'Never anyone else’s, and never a result before it is published.',
    can: ['Check attendance per subject', 'See upcoming exams', 'View published results'],
    panels: [
      {
        title: 'Attendance by subject',
        subtitle: 'Below 75% is highlighted',
        body: (
          <BarList
            unit="%"
            rows={[
              { label: 'CS301', value: 92, color: '#10b981', target: 75 },
              { label: 'CS302', value: 88, color: '#10b981', target: 75 },
              { label: 'CS303', value: 71, color: '#e11d48', target: 75 },
              { label: 'MA301', value: 90, color: '#10b981', target: 75 },
            ]}
          />
        ),
      },
      {
        title: 'My results',
        subtitle: 'Published only',
        body: (
          <ul className="pv-list">
            <li>
              <span>CSE Sem 3 — Internal Assessment 1</span>
              <StatusBadge status="PUBLISHED" />
            </li>
            <li>
              <span>CSE Sem 3 — Internal Assessment 2</span>
              <span className="pv-muted">Upcoming</span>
            </li>
          </ul>
        ),
      },
    ],
  },
]

/** Role picker (WAI-ARIA tabs) with the matching workspace preview. */
export function RoleWorkspaces() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef([])

  const focusTab = (index) => {
    const next = (index + ROLE_VIEWS.length) % ROLE_VIEWS.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const onKeyDown = (event) => {
    const keys = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: ROLE_VIEWS.length - 1 }
    if (event.key in keys) {
      event.preventDefault()
      focusTab(keys[event.key])
    }
  }

  const view = ROLE_VIEWS[active]

  return (
    <div className="hp-roles">
      <div className="hp-role-tabs" role="tablist" aria-label="Roles" aria-orientation="vertical">
        {ROLE_VIEWS.map((item, index) => {
          const Icon = item.icon
          const selected = index === active
          return (
            <button
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              type="button"
              role="tab"
              id={`role-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`role-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={`hp-role-tab ${selected ? 'is-active' : ''}`}
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
            >
              <span className={`hp-role-tab-icon tone-${item.tone}`} aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="hp-role-tab-text">
                <strong>{item.label}</strong>
                <span>{item.headline}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div
        className="hp-role-panel"
        role="tabpanel"
        id={`role-panel-${view.id}`}
        aria-labelledby={`role-tab-${view.id}`}
        tabIndex={0}
      >
        <div className="hp-role-swap" key={view.id}>
          <div className="hp-role-copy">
            <p className="hp-role-text">{view.text}</p>
            <ul className="hp-role-can">
              {view.can.map((item) => (
                <li key={item}>
                  <Check size={15} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="pv-window">
            <WindowChrome label={`College Portal · ${view.label} workspace`} />
            <div className="pv-main">
              <div className="pv-title">{view.label} dashboard</div>
              <div className="pv-subtitle">Sample data</div>
              <div className="pv-grid">
                {view.panels.map((panel) => (
                  <Panel key={panel.title} title={panel.title} subtitle={panel.subtitle}>
                    {panel.body}
                  </Panel>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
