import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { prefersReducedMotion } from './useReveal'

/** Floating button that appears once the visitor has scrolled past the hero. */
function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    // Keep keyboard focus on something visible once the button hides.
    document.querySelector('.hp-brand')?.focus({ preventScroll: true })
  }

  return (
    <button
      type="button"
      className={`hp-to-top ${visible ? 'is-visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  )
}

export default BackToTop
