import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'
import BackToTop from './BackToTop'
import PortalCta from './PortalCta'
import FeatureBento from './FeatureBento'
import { RoleWorkspaces } from './ProductPreviews'
import HeroShowcase from './HeroShowcase'
import ResultWorkflow from './ResultWorkflow'
import { useReveal, useScrollProgress } from './useReveal'
import { FAQS, PROBLEMS, SECURITY, STEPS } from './homeContent'
import './home.css'

function SectionHeading({ eyebrow, title, text, id, align = 'center', tone }) {
  return (
    <div className={`hp-heading hp-reveal ${align === 'left' ? 'is-left' : ''} ${tone === 'dark' ? 'is-dark' : ''}`}>
      {eyebrow && <p className="hp-eyebrow">{eyebrow}</p>}
      <h2 id={id}>{title}</h2>
      {text && <p className="hp-lead">{text}</p>}
    </div>
  )
}

const HERO_FACTS = [
  { value: '4', label: 'role-based workspaces' },
  { value: '4-step', label: 'result approval' },
  { value: 'Up to 8', label: 'semesters per course' },
]

function Hero() {
  return (
    <section id="top" className="hp-hero" aria-labelledby="hero-title">
      <div className="hp-container hx-grid">
        <div className="hx-copy">
          <h1 id="hero-title">
            Run your college operations from <span className="hp-gradient-text">one connected platform.</span>
          </h1>
          <p className="hx-lead">
            Manage students, academics, examinations, attendance and results through structured workflows built for
            administrators, principals, examiners and students.
          </p>
          <div className="hp-cta-row hx-ctas">
            <PortalCta className="btn btn-primary hp-btn" />
            <a href="#features" className="btn btn-secondary hp-btn">
              Explore Features
            </a>
          </div>
          <dl className="hx-facts">
            {HERO_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.value}</dt>
                <dd>{fact.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroShowcase />
      </div>
    </section>
  )
}

/** Where records live today, set against where they live in the portal. */
function Statement() {
  return (
    <section className="hp-section hp-problem" aria-labelledby="problem-title">
      <div className="hp-container hp-problem-grid">
        <div className="hp-problem-copy hp-reveal">
          <p className="hp-eyebrow">The problem</p>
          <h2 id="problem-title">
            Every office keeps its own copy. <span className="hp-problem-muted">Nobody can say which one is right.</span>
          </h2>
          <p className="hp-lead">
            When marks, approvals and attendance live in different places, every number has to be checked twice. The
            portal keeps one connected record instead.
          </p>
        </div>

        <ul className="hp-problem-list">
          {PROBLEMS.map(({ icon: Icon, label, before, after }, index) => (
            <li key={label} className="hp-problem-row hp-reveal" style={{ '--d': `${index * 90}ms` }}>
              <span className="hp-problem-icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <div className="hp-problem-body">
                <h3>{label}</h3>
                <p className="hp-problem-before">
                  <span className="visually-hidden">Today: </span>
                  {before}
                </p>
                <p className="hp-problem-after">
                  <ArrowRight size={16} aria-hidden="true" />
                  <span className="visually-hidden">With the portal: </span>
                  {after}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Four steps joined by a line that draws itself as the section scrolls in. */
function Steps() {
  const ref = useRef(null)
  useScrollProgress(ref, { start: 0.85, end: 0.35 })

  return (
    <div className="hp-steps-wrap" ref={ref}>
      <span className="hp-steps-line" aria-hidden="true">
        <span />
      </span>
      <ol className="hp-steps">
        {STEPS.map((step, index) => (
          <li key={step.title} className="hp-step" style={{ '--i': index }}>
            <span className="hp-step-num tabular" aria-hidden="true">
              {index + 1}
            </span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function FaqItem({ item, index, expanded, onToggle }) {
  const Icon = item.icon
  return (
    <div className={`hp-faq-item hp-reveal ${expanded ? 'is-open' : ''}`} style={{ '--d': `${(index % 3) * 70}ms` }}>
      <h3>
        <button
          type="button"
          id={`faq-q-${index}`}
          aria-expanded={expanded}
          aria-controls={`faq-a-${index}`}
          onClick={onToggle}
        >
          <span className="hp-faq-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
          <span className="hp-faq-q">
            <span className="hp-faq-topic">{item.topic}</span>
            {item.q}
          </span>
          <span className="hp-faq-toggle" aria-hidden="true">
            <Plus size={16} />
          </span>
        </button>
      </h3>
      <div
        id={`faq-a-${index}`}
        role="region"
        aria-labelledby={`faq-q-${index}`}
        className="hp-faq-answer"
        inert={expanded ? undefined : ''}
      >
        <div>
          <p>{item.a}</p>
        </div>
      </div>
    </div>
  )
}

/** Two independent columns, so opening a card never stretches its neighbour. */
function Faq() {
  const [open, setOpen] = useState(0)
  const half = Math.ceil(FAQS.length / 2)
  const columns = [FAQS.slice(0, half), FAQS.slice(half)]

  return (
    <div className="hp-faq">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="hp-faq-col">
          {column.map((item, rowIndex) => {
            const index = columnIndex * half + rowIndex
            return (
              <FaqItem
                key={item.q}
                item={item}
                index={index}
                expanded={open === index}
                onToggle={() => setOpen(open === index ? -1 : index)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function HomePage() {
  const rootRef = useRef(null)
  const { hash } = useLocation()
  useReveal(rootRef)

  useEffect(() => {
    document.title = 'College Portal — Connected college operations'
    return () => {
      document.title = 'College Portal'
    }
  }, [])

  // The page is lazy-loaded, so the browser can't jump to /#faq by itself.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <div className="hp" ref={rootRef}>
      <a href="#main" className="hp-skip">
        Skip to content
      </a>
      <PublicHeader />

      <main id="main">
        <Hero />
        <Statement />

        <section id="features" className="hp-section" aria-labelledby="features-title">
          <div className="hp-container">
            <SectionHeading
              id="features-title"
              eyebrow="Features"
              title="Everything the academic office runs on."
              text="Six modules that share one set of records, so work done in one is already correct in the others."
            />
            <FeatureBento />
          </div>
        </section>

        <ResultWorkflow />

        <section id="roles" className="hp-section hp-section-soft" aria-labelledby="roles-title">
          <div className="hp-container">
            <SectionHeading
              id="roles-title"
              eyebrow="Roles"
              title="One portal. Four workspaces."
              text="Everyone signs in to the same system and sees only what their responsibilities need."
            />
            <div className="hp-reveal">
              <RoleWorkspaces />
            </div>
          </div>
        </section>

        <section id="security" className="hp-section hp-section-dark" aria-labelledby="security-title">
          <div className="hp-container">
            <SectionHeading
              id="security-title"
              tone="dark"
              eyebrow="Security"
              title="Enforced on the server. Every request."
              text="The interface hides what a role can’t use — but it isn’t what keeps the data safe. The API is."
            />
            <ul className="hp-security-grid">
              {SECURITY.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="hp-security hp-reveal" style={{ '--d': `${(index % 3) * 80}ms` }}>
                  <span className="hp-security-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="hp-section" aria-labelledby="how-title">
          <div className="hp-container">
            <SectionHeading id="how-title" eyebrow="How it works" title="Up and running in four steps." />
            <Steps />
          </div>
        </section>

        <section id="faq" className="hp-section hp-section-soft" aria-labelledby="faq-title">
          <div className="hp-container">
            <SectionHeading
              id="faq-title"
              eyebrow="FAQ"
              title="Questions, answered."
              text="The details administrators usually ask about before rolling the portal out."
            />
            <Faq />
          </div>
        </section>

      </main>

      <PublicFooter />
      <BackToTop />
    </div>
  )
}

export default HomePage
