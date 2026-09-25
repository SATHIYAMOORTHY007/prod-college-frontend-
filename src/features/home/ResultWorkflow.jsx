import { useRef, useState } from 'react'
import { BatteryFull, Check, GraduationCap, Hourglass, Lock, Signal, Wifi } from 'lucide-react'
import { StatusBadge } from '../../components/ui'
import { RESULT_STAGES } from './homeContent'
import { useScrollProgress } from './useReveal'

/*
 * Pinned, scroll-driven walkthrough of one result. On wide screens the
 * staff's results window sits beside the student's phone, which stays empty
 * until publication. On phones only the device is shown, and it plays every
 * role in turn. All data is sample data.
 */

const MARKS = [
  { code: 'CS501', name: 'Operating Systems', score: 78 },
  { code: 'CS502', name: 'Computer Networks', score: 84 },
  { code: 'CS503', name: 'Software Engineering', score: 71 },
]
const TOTAL = MARKS.reduce((sum, mark) => sum + mark.score, 0)
const EXAM = 'CSE Sem 5 — Internal Assessment 1'

/** Stage (0–3) plus how far the examiner has typed during stage 0. */
function useWorkflowState(ref) {
  const [state, setState] = useState({ stage: 0, typed: 0 })
  useScrollProgress(ref, {
    mode: 'pin',
    always: true,
    onChange: (progress) => {
      const stage = Math.min(RESULT_STAGES.length - 1, Math.floor(progress * RESULT_STAGES.length))
      const typed = Math.round(Math.min(1, progress * RESULT_STAGES.length * 1.5) * 20) / 20
      setState((prev) => (prev.stage === stage && prev.typed === typed ? prev : { stage, typed }))
    },
  })
  return state
}

const scoreAt = (mark, typed) => Math.round(mark.score * typed)

function MarkValue({ mark, typed, locked }) {
  const value = scoreAt(mark, typed)
  return (
    <span className={`wf-mark ${locked ? 'is-locked' : ''}`}>
      {locked && <Lock size="0.85em" aria-hidden="true" />}
      <span className="tabular">{value || '—'}</span>
      <span className="wf-mark-max">/ 100</span>
    </span>
  )
}

/* ------------------------------------------------------ Desktop window */

function ResultWindow({ stage, typed }) {
  const current = RESULT_STAGES[stage]
  const total = MARKS.reduce((sum, mark) => sum + scoreAt(mark, typed), 0)
  return (
    <div className="pv-window wf-window">
      <div className="pv-chrome">
        <span />
        <span />
        <span />
        <div className="pv-url">College Portal · {stage < 2 ? 'Examiner' : 'Principal'} workspace</div>
      </div>
      <div className="wf-window-body">
        <div className="wf-window-head">
          <div className="min-w-0">
            <div className="pv-title">{EXAM}</div>
            <div className="pv-subtitle mb-0">24CSE118 · B.E. Computer Science and Engineering</div>
          </div>
          <span className="wf-pop" key={current.status}>
            <StatusBadge status={current.status} />
          </span>
        </div>

        <div className="wf-table">
          <div className="wf-table-row is-head">
            <span>Subject</span>
            <span>Marks</span>
          </div>
          {MARKS.map((mark) => (
            <div key={mark.code} className="wf-table-row">
              <span>
                <span className="wf-code">{mark.code}</span> {mark.name}
              </span>
              <MarkValue mark={mark} typed={typed} locked={stage >= 1} />
            </div>
          ))}
          <div className="wf-table-row is-total">
            <span>Total</span>
            <span className="tabular">
              {total} / {MARKS.length * 100}
            </span>
          </div>
        </div>

        <ol className="wf-log">
          {RESULT_STAGES.map((item, index) => (
            <li key={item.status} className={index <= stage ? 'is-done' : ''}>
              <span className="wf-log-dot">{index <= stage && <Check size={10} strokeWidth={3} />}</span>
              {item.event}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- Phone */

function MarkRows({ typed, locked }) {
  return (
    <div className="ph-marks">
      {MARKS.map((mark, index) => (
        <div key={mark.code} className="ph-row" style={{ '--i': index }}>
          <span className="ph-row-name">
            <span className="ph-code">{mark.code}</span>
            {mark.name}
          </span>
          <MarkValue mark={mark} typed={typed} locked={locked} />
        </div>
      ))}
    </div>
  )
}

function Phone({ stage, typed }) {
  const published = stage === 3
  const actor = stage < 2 ? 'Examiner' : 'Principal'

  return (
    <div className="wf-phone">
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

          <div className="ph-body">
            {/* Staff view: shown on small screens, where the phone tells the whole story. */}
            <div className={`ph-layer ph-staff ${published ? '' : 'is-shown'}`}>
              <div className="ph-appbar">
                <span className="ph-appbar-title">Results</span>
                <span className={`ph-actor ${actor === 'Examiner' ? 'tone-sky' : 'tone-indigo'}`} key={actor}>
                  {actor}
                </span>
              </div>
              <div className="ph-card">
                <div className="ph-card-head">
                  <strong>{EXAM}</strong>
                  <span className="wf-pop" key={stage}>
                    <StatusBadge status={RESULT_STAGES[stage].status} />
                  </span>
                </div>
                <MarkRows typed={typed} locked={stage >= 1} />
                <div className="ph-total">
                  <span>Total</span>
                  <span className="tabular">{MARKS.reduce((sum, mark) => sum + scoreAt(mark, typed), 0)} / 300</span>
                </div>
              </div>
              <div className="ph-footer" key={`f${stage}`}>
                {stage === 0 && <span className="ph-btn is-primary">Submit for approval</span>}
                {stage === 1 && (
                  <span className="ph-note tone-amber">
                    <Hourglass size="1em" /> Waiting for the principal
                  </span>
                )}
                {stage === 2 && (
                  <>
                    <span className="ph-note tone-green">
                      <Check size="1em" /> Approved by Dr. R. Venkatesan
                    </span>
                    <span className="ph-btn is-primary">Publish to student</span>
                  </>
                )}
              </div>
            </div>

            {/* Student view before publication: shown beside the desktop window. */}
            <div className={`ph-layer ph-empty ${published ? '' : 'is-shown'}`}>
              <div className="ph-appbar">
                <span className="ph-appbar-title">My Results</span>
              </div>
              <div className="ph-card ph-empty-card">
                <span className="ph-empty-icon">
                  <Lock size="1.4em" />
                </span>
                <strong>Nothing published yet</strong>
                <span>Results appear here once the principal publishes them.</span>
              </div>
              <div className="ph-card ph-pending">
                <span>{EXAM}</span>
                <span className="ph-chip">Not published</span>
              </div>
            </div>

            {/* Student view after publication. */}
            <div className={`ph-layer ph-student ${published ? 'is-shown' : ''}`}>
              <div className="ph-appbar">
                <span className="ph-appbar-title">My Results</span>
              </div>
              <div className="ph-card">
                <div className="ph-card-head">
                  <strong>{EXAM}</strong>
                  <StatusBadge status="PUBLISHED" />
                </div>
                <MarkRows typed={1} locked={false} />
                <div className="ph-total">
                  <span>Total</span>
                  <span className="tabular">{TOTAL} / 300</span>
                </div>
              </div>
              <div className="ph-footer">
                <StatusBadge status="PASS" label="Pass in all subjects" />
              </div>
            </div>
          </div>

          <div className={`ph-notif ${published ? 'is-shown' : ''}`}>
            <span className="ph-notif-icon">
              <GraduationCap size="1.3em" />
            </span>
            <span className="ph-notif-text">
              <span className="ph-notif-app">College Portal · now</span>
              <strong>Result published</strong>
              <span>Your result for {EXAM} is now available.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- Section */

function ResultWorkflow() {
  const ref = useRef(null)
  const { stage, typed } = useWorkflowState(ref)
  const current = RESULT_STAGES[stage]

  return (
    <section
      id="results"
      className={`wf ${stage === 3 ? 'is-published' : ''}`}
      ref={ref}
      aria-labelledby="results-title"
    >
      <div className="wf-sticky">
        <div className="hp-container wf-layout">
          <div className="wf-head">
            <p className="hp-eyebrow">Result workflow</p>
            <h2 id="results-title">No result reaches a student without approval.</h2>
          </div>

          {/* The animated scene is decorative; this list carries the content. */}
          <ol className="visually-hidden">
            {RESULT_STAGES.map((item) => (
              <li key={item.status}>
                {item.title} ({item.owner}): {item.text}
              </li>
            ))}
          </ol>

          <div className="wf-caption" aria-hidden="true">
            <div className="wf-caption-inner" key={stage}>
              <p className="wf-caption-meta">
                Step {stage + 1} of {RESULT_STAGES.length} · {current.owner}
              </p>
              <h3>{current.title}</h3>
              <p>{current.text}</p>
            </div>
          </div>

          <div className="wf-steps" aria-hidden="true">
            <span className="wf-steps-line">
              <span />
            </span>
            <ol>
              {RESULT_STAGES.map((item, index) => (
                <li key={item.status} className={index < stage ? 'is-done' : index === stage ? 'is-active' : ''}>
                  <span className="wf-node">{index < stage ? <Check size={14} strokeWidth={3} /> : index + 1}</span>
                  <span className="wf-label">{item.status.charAt(0) + item.status.slice(1).toLowerCase()}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="wf-scene" aria-hidden="true">
            <ResultWindow stage={stage} typed={typed} />
            <Phone stage={stage} typed={typed} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResultWorkflow
