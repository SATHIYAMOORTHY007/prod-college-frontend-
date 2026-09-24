import { PERMISSIONS } from '../../constants/roles'
import { RESULT_STATUS } from '../../constants/semesters'
import { formatDate } from '../../utils/format'

/**
 * UI mirror of the backend transition table, used to decide which buttons
 * to show and what to explain. The backend rejects anything not allowed.
 */
export const RESULT_ACTIONS = {
  submit: {
    from: RESULT_STATUS.DRAFT,
    permission: PERMISSIONS.RESULTS_SUBMIT,
    label: 'Submit for approval',
    variant: 'primary',
    confirm: {
      title: 'Submit for approval?',
      message: 'The marks will be locked and sent to the principal for review. You can edit them again only if the principal sends them back.',
      cta: 'Submit',
    },
  },
  reject: {
    from: RESULT_STATUS.SUBMITTED,
    permission: PERMISSIONS.RESULTS_APPROVE,
    label: 'Send back',
    variant: 'secondary',
    needsNote: true,
  },
  approve: {
    from: RESULT_STATUS.SUBMITTED,
    permission: PERMISSIONS.RESULTS_APPROVE,
    label: 'Approve',
    variant: 'success',
    confirm: {
      title: 'Approve this result?',
      message: 'The marks will be finalised. The student will see them only after you publish.',
      cta: 'Approve',
    },
  },
  publish: {
    from: RESULT_STATUS.APPROVED,
    permission: PERMISSIONS.RESULTS_PUBLISH,
    label: 'Publish to student',
    variant: 'primary',
    confirm: {
      title: 'Publish to the student?',
      message: 'The student will be notified and can view the result immediately. Published results cannot be changed.',
      cta: 'Publish',
    },
  },
}

/**
 * @param {string} status current result status
 * @param {(permission: string) => boolean} can
 * @returns {string[]} action names available to this user
 */
export function availableActions(status, can) {
  return Object.entries(RESULT_ACTIONS)
    .filter(([, action]) => action.from === status && can(action.permission))
    .map(([name]) => name)
}

export const STATUS_STEPS = [RESULT_STATUS.DRAFT, RESULT_STATUS.SUBMITTED, RESULT_STATUS.APPROVED, RESULT_STATUS.PUBLISHED]

/** A draft that the principal returned with a note. */
export const isSentBack = (result) => result?.status === RESULT_STATUS.DRAFT && Boolean(result.reviewNote)

/**
 * Plain-language answer to "who has to do what next?" for any result.
 * @returns {{ owner: 'Examiner'|'Principal'|null, label: string, message: string }}
 */
export function nextStep(result) {
  switch (result?.status) {
    case RESULT_STATUS.DRAFT:
      return isSentBack(result)
        ? { owner: 'Examiner', label: 'Examiner to correct', message: 'The principal sent these marks back. The examiner must correct them and submit again.' }
        : { owner: 'Examiner', label: 'Examiner to submit', message: 'Marks are saved as a draft. The assigned examiner (or an admin) must submit them for approval.' }
    case RESULT_STATUS.SUBMITTED:
      return { owner: 'Principal', label: 'Principal to review', message: 'Waiting for the principal (or an admin) to approve the marks or send them back.' }
    case RESULT_STATUS.APPROVED:
      return { owner: 'Principal', label: 'Principal to publish', message: 'Approved. The principal (or an admin) must publish it before the student can see it.' }
    case RESULT_STATUS.PUBLISHED:
      return { owner: null, label: 'Complete', message: `Published${result.publishedAt ? ` on ${formatDate(result.publishedAt)}` : ''}. The student can view this result.` }
    default:
      return { owner: null, label: '—', message: '' }
  }
}
