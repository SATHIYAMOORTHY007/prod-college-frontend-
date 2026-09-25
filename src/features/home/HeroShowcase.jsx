import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  BatteryFull,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  Hourglass,
  LayoutDashboard,
  Percent,
  ScrollText,
  Signal,
  Users,
  Wifi,
} from 'lucide-react'
import { BarList, MiniKpi, Panel, Pipeline } from './ProductPreviews'
import { prefersReducedMotion, useScrollProgress } from './useReveal'

/*
 * Hero visual: the same college seen by three roles on three devices —
 * the principal's dashboard on a laptop, an examiner taking attendance on
 * a tablet and a student's home screen on a phone. All sample data.
 *
 * The lineup is laid out at a fixed design size (--dw × --dh, set per
 * breakpoint in CSS) and scaled to fit its column, so it keeps its
 * composition on every screen.
 */

function useFitScale(ref) {
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const apply = () => {
      const designWidth = parseFloat(getComputedStyle(element).getPropertyValue('--dw')) || 800
      element.style.setProperty('--s', String(element.clientWidth / designWidth))
    }
    apply()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(apply)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
}

/** Counts up to `to` once, shortly after the page opens. */
function CountUp({ to, decimals = 0, suffix = '', delay = 700, duration = 1400 }) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? to : 0))

  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    let frame = 0
    let startedAt = null
    const step = (time) => {
      startedAt ??= time
      const t = Math.min(1, (time - startedAt) / duration)
      setValue(to * (1 - (1 - t) ** 3))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step)
    }, delay)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [to, delay, duration])

  return (
    <>
      {value.toFixed(decimals)}
      {suffix}
    </>
  )
}

const SIDEBAR_ICONS = [LayoutDashboard, GraduationCap, Users, Building2, BookOpen, CalendarClock, ClipboardCheck, ScrollText]

function Laptop() {
  return (
    <div className="dv dv-laptop">
      <div className="dv-laptop-screen">
        <span className="dv-laptop-cam" />
        <div className="pv-app">
          <div className="pv-sidebar">
            <span className="pv-sidebar-brand">
              <GraduationCap size={14} />
            </span>
            {SIDEBAR_ICONS.map((Icon, index) => (
              <span key={index} className={`pv-sidebar-item ${index === 0 ? 'is-active' : ''}`}>
                <Icon size={14} />
              </span>
            ))}
          </div>
          <div className="pv-main">
            <div className="pv-title">Good morning, Dr. Venkatesan</div>
            <div className="pv-subtitle">Academic performance and pending decisions.</div>
            <div className="pv-kpis">
              <MiniKpi icon={GraduationCap} tone="indigo" label="Total students" value={<CountUp to={446} />} />
              <MiniKpi icon={CalendarCheck} tone="green" label="Attendance" value={<CountUp to={86.4} decimals={1} suffix="%" />} />
              <MiniKpi icon={Percent} tone="sky" label="Pass rate" value={<CountUp to={91.2} decimals={1} suffix="%" />} />
              <MiniKpi icon={Hourglass} tone="amber" label="Pending approvals" value={<CountUp to={18} />} />
            </div>
            <div className="pv-alert">
              <span>
                <strong>18</strong> results are waiting for your approval.
              </span>
              <span className="pv-fake-btn">Review now</span>
            </div>
            <div className="pv-grid">
              <Panel title="Pass rate by department" subtitle="Finalised results">
                <BarList
                  rows={[
                    { label: 'CSE', value: 93, color: '#10b981' },
                    { label: 'ECE', value: 89, color: '#10b981' },
                    { label: 'MECH', value: 90, color: '#10b981' },
                  ]}
                  unit="%"
                />
              </Panel>
              <Panel title="Result pipeline" subtitle="Results by workflow stage">
                <Pipeline />
              </Panel>
            </div>
          </div>
        </div>
      </div>
      <div className="dv-laptop-base" />
    </div>
  )
}

const ROSTER = [
  ['24CSE001', 'Aarav S.', true],
  ['24CSE002', 'Divya K.', true],
  ['24CSE003', 'Farhan M.', false],
  ['24CSE004', 'Harini P.', true],
  ['24CSE005', 'Joel T.', true],
  ['24CSE006', 'Keerthana R.', true],
]

function Tablet() {
  const present = ROSTER.filter(([, , isPresent]) => isPresent).length
  return (
    <div className="dv dv-tablet">
      <div className="dv-tablet-screen">
        <div className="tb-head">
          <strong>Mark attendance</strong>
          <span>CS303 · Database Management Systems</span>
          <div className="tb-chips">
            <span>Sem 3 · Sec A</span>
            <span>Today</span>
          </div>
        </div>
        <div className="tb-summary">
          <span className="tone-green">{present} present</span>
          <span className="tone-rose">{ROSTER.length - present} absent</span>
        </div>
        <ul className="tb-roster">
          {ROSTER.map(([roll, name, isPresent], index) => (
            <li key={roll} style={{ '--i': index }}>
              <span className="tb-student">
                <strong>{name}</strong>
                <span>{roll}</span>
              </span>
              <span className="attendance-toggle">
                <button type="button" tabIndex={-1} className={isPresent ? 'is-present' : ''}>
                  P
                </button>
                <button type="button" tabIndex={-1} className={isPresent ? '' : 'is-absent'}>
                  A
                </button>
              </span>
            </li>
          ))}
        </ul>
        <span className="tb-save">Save attendance</span>
      </div>
    </div>
  )
}

function Phone() {
  return (
    <div className="dv dv-phone">
      <div className="wf-phone-frame">
        <div className="ph-screen">
          <span className="ph-island" />
          <div className="ph-status">
            <span>9:41</span>
            <span className="ph-status-icons">
              <Signal size="1.1em" />
              <Wifi size="1.1em" />
              <BatteryFull size="1.3em" />
            </span>
          </div>
          <div className="hx-phone-body">
            <div className="ph-appbar">
              <span className="ph-appbar-title">Hi, Aarav</span>
              <span className="hx-avatar">AS</span>
            </div>
            <div className="ph-card hx-ring-card">
              <span className="hx-ring" style={{ '--v': 85 }}>
                <span>85%</span>
              </span>
              <span>
                <strong>Attendance</strong>
                <span>This semester · minimum 75%</span>
              </span>
            </div>
            <div className="ph-card hx-upcoming">
              <span className="hx-upcoming-label">Upcoming exam</span>
              <strong>CSE Sem 3 — Internal Assessment 2</strong>
              <span>Starts in 9 days</span>
            </div>
          </div>
          <div className="ph-notif hx-notif">
            <span className="ph-notif-icon">
              <GraduationCap size="1.3em" />
            </span>
            <span className="ph-notif-text">
              <span className="ph-notif-app">College Portal · now</span>
              <strong>Result published</strong>
              <span>CSE Sem 3 — Internal Assessment 1 is now available.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroShowcase() {
  const fitRef = useRef(null)
  useFitScale(fitRef)
  // Devices drift apart at different speeds as the page scrolls.
  useScrollProgress(fitRef, { start: 0.3, end: -0.6, varName: '--hx', reducedValue: 0 })

  return (
    <figure className="hx-visual">
      <div className="hx-glow" aria-hidden="true" />
      <div
        className="hx-fit"
        ref={fitRef}
        role="img"
        aria-label="The portal on three devices with sample data: the principal's dashboard on a laptop, an examiner marking attendance on a tablet, and a student's home screen on a phone receiving a result notification."
      >
        <div className="hx-stage">
          <Laptop />
          <Tablet />
          <Phone />
        </div>
      </div>
      <figcaption className="hx-caption">Principal on desktop · Examiner on tablet · Student on phone — sample data</figcaption>
    </figure>
  )
}

export default HeroShowcase
