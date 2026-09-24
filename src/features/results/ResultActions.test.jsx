import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResultActions from './ResultActions'
import { renderWithProviders, signedInAs } from '../../test/renderWithProviders'

const PRINCIPAL = ['results:view', 'results:approve', 'results:publish']
const EXAMINER = ['results:view', 'results:create', 'results:submit']
const STUDENT = ['results:view']

function renderActions(status, permissions, onAction = vi.fn()) {
  renderWithProviders(<ResultActions result={{ id: 'r1', status }} onAction={onAction} />, {
    preloadedState: signedInAs('ANY', permissions),
  })
  return onAction
}

const buttonNames = () => screen.queryAllByRole('button').map((button) => button.textContent)

describe('ResultActions', () => {
  it('offers the examiner "Submit" on a draft only', () => {
    renderActions('DRAFT', EXAMINER)
    expect(buttonNames()).toEqual(['Submit for approval'])
  })

  it('offers the examiner nothing once submitted', () => {
    renderActions('SUBMITTED', EXAMINER)
    expect(buttonNames()).toEqual([])
  })

  it('offers the principal approve / send back on a submitted result', () => {
    renderActions('SUBMITTED', PRINCIPAL)
    expect(buttonNames()).toEqual(['Send back', 'Approve'])
  })

  it('offers the principal publish on an approved result, never skipping a step', () => {
    renderActions('APPROVED', PRINCIPAL)
    expect(buttonNames()).toEqual(['Publish to student'])

    renderActions('DRAFT', PRINCIPAL)
    expect(screen.queryByText('Approve')).not.toBeInTheDocument()
  })

  it('offers students no workflow actions', () => {
    renderActions('PUBLISHED', STUDENT)
    expect(buttonNames()).toEqual([])
  })

  it('reports the chosen action', async () => {
    const onAction = renderActions('SUBMITTED', PRINCIPAL)
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(onAction).toHaveBeenCalledWith('approve')
  })
})
