import { Bell, CalendarCheck, CalendarClock, ChevronRight, GraduationCap, Layers, ScrollText, Send } from 'lucide-react'
import { StatusBadge } from '../../components/ui'

/*
 * One tile per module. The small visuals are decorative mock-ups of the
 * real screens (hidden from assistive tech); the heading and text carry
 * the meaning.
 */

function StudentsVisual() {
  const rows = [
    ['24CSE001', 'Aarav S.', 'BE-CSE', '3', 'A'],
    ['24ECE041', 'Meera N.', 'BE-ECE', '3', 'B'],
    ['23MECH012', 'Karthik R.', 'BE-MECH', '5', 'A'],
  ]
  return (
    <div className="bv-table" aria-hidden="true">
      <div className="bv-row is-head">
        <span>Roll no.</span>
        <span>Name</span>
        <span>Course</span>
        <span>Sem</span>
        <span>Sec</span>
      </div>
      {rows.map((row) => (
        <div key={row[0]} className="bv-row">
          {row.map((cell, index) => (
            <span key={index} className={index === 0 ? 'bv-mono' : ''}>
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function StructureVisual() {
  const levels = ['Computer Science', 'B.E. CSE', 'Semester 3', 'CS303 · DBMS']
  return (
    <ol className="bv-path" aria-hidden="true">
      {levels.map((level, index) => (
        <li key={level} style={{ '--i': index }}>
          {level}
          {index < levels.length - 1 && <ChevronRight size={12} />}
        </li>
      ))}
    </ol>
  )
}

function ExamsVisual() {
  return (
    <ul className="bv-list" aria-hidden="true">
      <li>
        <span>Internal Assessment 2</span>
        <StatusBadge status="INTERNAL" />
      </li>
      <li>
        <span>End Semester</span>
        <StatusBadge status="SEMESTER" />
      </li>
      <li>
        <span>Thermal Lab</span>
        <StatusBadge status="PRACTICAL" />
      </li>
    </ul>
  )
}

function AttendanceVisual() {
  const roster = [
    ['24CSE001', true],
    ['24CSE002', true],
    ['24CSE003', false],
  ]
  return (
    <ul className="bv-list" aria-hidden="true">
      {roster.map(([roll, present]) => (
        <li key={roll}>
          <span className="bv-mono">{roll}</span>
          <span className="attendance-toggle">
            <button type="button" tabIndex={-1} className={present ? 'is-present' : ''}>
              P
            </button>
            <button type="button" tabIndex={-1} className={present ? '' : 'is-absent'}>
              A
            </button>
          </span>
        </li>
      ))}
    </ul>
  )
}

function NotificationsVisual() {
  const items = [
    { icon: CalendarClock, title: 'New exam scheduled', text: 'CSE Sem 3 — IA 2' },
    { icon: Bell, title: 'Result published', text: 'CSE Sem 3 — IA 1' },
    { icon: Send, title: 'Sent back for correction', text: 'To the examiner' },
  ]
  return (
    <ul className="bv-toasts" aria-hidden="true">
      {items.map(({ icon: Icon, title, text }, index) => (
        <li key={title} style={{ '--i': index }}>
          <Icon size={13} />
          <span>
            <strong>{title}</strong> {text}
          </span>
        </li>
      ))}
    </ul>
  )
}

function AuditVisual() {
  const rows = [
    ['09:42', 'Dr. R. Venkatesan', 'RESULT_APPROVED', 'Result · 24CSE118', false],
    ['09:15', 'Portal Administrator', 'MARKS_UPDATED', 'Result · 24ECE041', true],
    ['08:58', 'Dr. Priya Raman', 'ATTENDANCE_MARKED', 'CS303 · 62 students', false],
    ['08:30', 'Dr. Priya Raman', 'USER_LOGIN', 'Session started', false],
  ]
  return (
    <div className="bv-log" aria-hidden="true">
      {rows.map(([time, actor, action, target, override]) => (
        <div key={time} className="bv-log-row">
          <span className="bv-mono bv-soft">{time}</span>
          <span className="bv-actor">{actor}</span>
          <span className="bv-action">{action.toLowerCase().replace(/_/g, ' ')}</span>
          <span className="bv-soft bv-target">{target}</span>
          {override && <span className="bv-flag">Admin override</span>}
        </div>
      ))}
    </div>
  )
}

const TILES = [
  {
    span: 'is-wide',
    icon: GraduationCap,
    title: 'Every student, one record',
    text: 'Profiles with roll number, department, course, semester and section — searchable and filterable by staff.',
    visual: <StudentsVisual />,
  },
  {
    span: 'is-narrow',
    icon: Layers,
    title: 'Structured from the top down',
    text: 'Subjects belong to a course and semester, with their own credits, maximum and pass marks.',
    visual: <StructureVisual />,
  },
  {
    span: 'is-third',
    icon: CalendarClock,
    title: 'Exams with an owner',
    text: 'Internal, end-semester and practical exams, each with its subjects and an assigned examiner.',
    visual: <ExamsVisual />,
  },
  {
    span: 'is-third',
    icon: CalendarCheck,
    title: 'Attendance in a tap',
    text: 'Present or absent, per subject and date. Percentages are calculated for you.',
    visual: <AttendanceVisual />,
  },
  {
    span: 'is-third',
    icon: Bell,
    title: 'Nobody has to chase',
    text: 'Students are notified in the portal when an exam is scheduled or a result is published.',
    visual: <NotificationsVisual />,
  },
  {
    span: 'is-full',
    icon: ScrollText,
    title: 'A history you can rely on',
    text: 'Logins, record changes, marks edits and every result decision — with who, what and when. Filter by action and date.',
    visual: <AuditVisual />,
  },
]

function FeatureBento() {
  // One listener for the whole grid moves the spotlight on the hovered tile.
  const onPointerMove = (event) => {
    const tile = event.target.closest?.('.hp-tile')
    if (!tile) return
    const rect = tile.getBoundingClientRect()
    tile.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    tile.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }

  return (
    <ul className="hp-bento" onPointerMove={onPointerMove}>
      {TILES.map(({ span, icon: Icon, title, text, visual }, index) => (
        <li key={title} className={`hp-tile ${span} hp-reveal`} style={{ '--d': `${(index % 3) * 80}ms` }}>
          <div className="hp-tile-copy">
            <span className="hp-tile-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
          <div className="hp-tile-visual">{visual}</div>
        </li>
      ))}
    </ul>
  )
}

export default FeatureBento
