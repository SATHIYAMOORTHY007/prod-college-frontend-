import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import HomePage from './HomePage'
import { initialState as authInitialState } from '../../store/slices/authSlice'
import { renderWithProviders, signedInAs } from '../../test/renderWithProviders'

const signedOut = { auth: { ...authInitialState, initialized: true } }

function renderHome(preloadedState = signedOut) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<div>Login page</div>} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
    </Routes>,
    { preloadedState },
  )
}

describe('HomePage', () => {
  it('points every login CTA at the existing login route', () => {
    renderHome()
    const logins = screen.getAllByRole('link', { name: /^login/i })
    // header and hero (the mobile menu's copy is hidden until opened)
    expect(logins.length).toBeGreaterThanOrEqual(2)
    logins.forEach((link) => expect(link).toHaveAttribute('href', '/login'))
  })

  it('navigates to the login page without a reload', async () => {
    renderHome()
    await userEvent.click(screen.getAllByRole('link', { name: 'Login to Portal' })[0])
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('offers "Go to Portal" to signed-in users', () => {
    renderHome(signedInAs('PRINCIPAL'))
    expect(screen.queryByRole('link', { name: /^login/i })).not.toBeInTheDocument()
    screen.getAllByRole('link', { name: /go to portal/i }).forEach((link) => expect(link).toHaveAttribute('href', '/dashboard'))
  })

  it('links the navigation to sections that exist on the page', () => {
    const { container } = renderHome()
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    within(nav)
      .getAllByRole('link')
      .forEach((link) => {
        const id = link.getAttribute('href').slice(1)
        expect(container.querySelector(`#${id}`)).not.toBeNull()
      })
  })

  it('toggles the mobile menu accessibly', async () => {
    renderHome()
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  })

  it('switches role workspaces with the keyboard', async () => {
    renderHome()
    screen.getByRole('tab', { name: /^Admin/ }).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('tab', { name: /^Principal/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Principal dashboard')
  })

  it('opens one FAQ answer at a time', async () => {
    renderHome()
    const first = screen.getByRole('button', { name: /who can sign in/i })
    const second = screen.getByRole('button', { name: /examiner is absent/i })
    expect(first).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(second)
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(first).toHaveAttribute('aria-expanded', 'false')
  })

  it('describes every result stage to assistive tech and starts at Draft', () => {
    const { container } = renderHome()
    const section = container.querySelector('#results')
    expect(within(section).getByText(/Examiner enters marks \(Examiner\)/)).toBeInTheDocument()
    expect(within(section).getByText(/Published to the student \(Principal\)/)).toBeInTheDocument()
    expect(section.querySelector('.wf-steps li.is-active')).toHaveTextContent('Draft')
    expect(section.querySelector('.ph-notif')).not.toHaveClass('is-shown')
  })

  describe('scroll reveal', () => {
    afterEach(() => vi.unstubAllGlobals())

    it('keeps FAQ cards revealed after they open and close', async () => {
      // Reports every observed element as on screen straight away.
      class InstantObserver {
        constructor(callback) {
          this.callback = callback
        }
        observe(target) {
          this.callback([{ target, isIntersecting: true }])
        }
        unobserve() {}
        disconnect() {}
      }
      vi.stubGlobal('IntersectionObserver', InstantObserver)

      const { container } = renderHome()
      const cards = () => [...container.querySelectorAll('#faq .hp-faq-item')]
      expect(cards().every((card) => card.hasAttribute('data-revealed'))).toBe(true)

      await userEvent.click(screen.getByRole('button', { name: /examiner is absent/i }))
      await userEvent.click(screen.getByRole('button', { name: /examiner is absent/i }))
      expect(cards().every((card) => card.hasAttribute('data-revealed'))).toBe(true)
    })
  })

  it('shows the floating back-to-top button only after scrolling down', async () => {
    renderHome()
    // Hidden from assistive tech until it appears, so look it up by title.
    const button = screen.getByTitle('Back to top')
    expect(button).not.toHaveClass('is-visible')
    expect(button).toHaveAttribute('tabindex', '-1')

    window.scrollY = window.innerHeight * 2
    await act(async () => {
      fireEvent.scroll(window)
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })
    expect(button).toHaveClass('is-visible')
    expect(screen.getByRole('button', { name: 'Back to top' })).toBe(button)

    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    await userEvent.click(button)
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }))
    scrollTo.mockRestore()
    window.scrollY = 0
  })
})
