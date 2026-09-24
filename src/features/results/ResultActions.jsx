import { Button } from '../../components/ui'
import { usePermission } from '../../hooks/usePermission'
import { RESULT_ACTIONS, availableActions } from './resultWorkflow'

/**
 * Workflow buttons for one result. Shows only the moves that are valid
 * for its current status *and* allowed for the signed-in role.
 */
function ResultActions({ result, onAction, pendingAction, size = 'sm' }) {
  const can = usePermission()
  const actions = availableActions(result.status, can)
  if (!actions.length) return null

  return (
    <div className="d-inline-flex gap-1 flex-wrap">
      {actions.map((name) => (
        <Button
          key={name}
          size={size}
          variant={RESULT_ACTIONS[name].variant}
          loading={pendingAction === name}
          disabled={Boolean(pendingAction)}
          onClick={() => onAction(name)}
        >
          {RESULT_ACTIONS[name].label}
        </Button>
      ))}
    </div>
  )
}

export default ResultActions
