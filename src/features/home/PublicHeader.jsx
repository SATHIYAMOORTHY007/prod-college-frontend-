import { useEffect, useRef, useState } from 'react'
import { GraduationCap, Menu, X } from 'lucide-react'
import PortalCta from './PortalCta'
import { NAV_LINKS } from './homeContent'

function PublicHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggleRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape closes the mobile menu and hands focus back to the toggle.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onResize = () => window.innerWidth >= 992 && setOpen(false)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`hp-header ${scrolled || open ? 'is-raised' : ''}`}>
      <div className="hp-container hp-header-inner">
        <a href="#top" className="hp-brand" onClick={close}>
          <span className="brand-mark" aria-hidden="true">
            <GraduationCap size={20} />
          </span>
          <span>College Portal</span>
        </a>

        <nav className="hp-nav" aria-label="Primary">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hp-header-actions">
          <PortalCta className="btn btn-primary hp-header-login" loginLabel="Login" />
          <button
            ref={toggleRef}
            type="button"
            className="btn btn-ghost btn-icon hp-menu-toggle"
            aria-expanded={open}
            aria-controls="hp-mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <nav id="hp-mobile-menu" className="hp-mobile-menu" aria-label="Mobile" hidden={!open}>
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={close}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <PortalCta className="btn btn-primary w-100 py-2" onClick={close} />
      </nav>
    </header>
  )
}

export default PublicHeader
