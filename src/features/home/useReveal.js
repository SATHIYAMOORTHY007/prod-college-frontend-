import { useEffect, useRef } from 'react'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

/**
 * Fades `.hp-reveal` elements in the first time they scroll into view.
 * Content is visible by default; the hidden start state only applies once
 * the `hp-js` class is set, so nothing is lost without JS or observers.
 *
 * The revealed state is a `data-revealed` attribute rather than a class:
 * React rewrites `className` whenever a component's classes change (an
 * FAQ item opening, say), which would silently hide it again. Elements
 * rendered later are picked up by the MutationObserver.
 */
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', '')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    const watch = () => root.querySelectorAll('.hp-reveal:not([data-revealed])').forEach((element) => observer.observe(element))
    watch()
    root.classList.add('hp-js')

    const mutations = typeof MutationObserver === 'undefined' ? null : new MutationObserver(watch)
    mutations?.observe(root, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mutations?.disconnect()
    }
  }, [rootRef])
}

/**
 * Writes scroll progress (0 → 1) to the element's `--p` custom property,
 * once per animation frame and without re-rendering React.
 *
 * - `pin`: progress while a tall element scrolls past a sticky child
 *   (top reaches the viewport top → bottom reaches the viewport bottom).
 * - `range`: progress as the element's top moves from `start` to `end`,
 *   both given as fractions of the viewport height.
 *
 * With reduced motion the progress is fixed at `reducedValue` unless
 * `always` is set, which is meant for scroll-driven state rather than
 * decoration. `varName` picks the custom property written.
 */
export function useScrollProgress(
  ref,
  { mode = 'range', start = 1, end = 0, always = false, onChange, varName = '--p', reducedValue = 1 } = {},
) {
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    if (!always && prefersReducedMotion()) {
      element.style.setProperty(varName, String(reducedValue))
      onChangeRef.current?.(reducedValue)
      return undefined
    }

    let frame = 0
    const update = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const vh = window.innerHeight
      const raw =
        mode === 'pin' ? -rect.top / Math.max(1, rect.height - vh) : (vh * start - rect.top) / Math.max(1, vh * (start - end))
      const progress = Math.min(1, Math.max(0, raw))
      element.style.setProperty(varName, progress.toFixed(4))
      onChangeRef.current?.(progress)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ref, mode, start, end, always, varName, reducedValue])
}
