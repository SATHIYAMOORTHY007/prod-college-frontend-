const TONES = {
  DRAFT: 'tone-slate',
  SUBMITTED: 'tone-amber',
  APPROVED: 'tone-sky',
  PUBLISHED: 'tone-green',
  SENT_BACK: 'tone-rose',
  ACTIVE: 'tone-green',
  INACTIVE: 'tone-slate',
  PRESENT: 'tone-green',
  ABSENT: 'tone-rose',
  PASS: 'tone-green',
  FAIL: 'tone-rose',
  UPCOMING: 'tone-indigo',
  IN_PROGRESS: 'tone-amber',
  COMPLETED: 'tone-slate',
  INTERNAL: 'tone-indigo',
  SEMESTER: 'tone-sky',
  PRACTICAL: 'tone-amber',
  ADMIN: 'tone-rose',
  PRINCIPAL: 'tone-indigo',
  EXAMINER: 'tone-sky',
  STUDENT: 'tone-green',
}

const toLabel = (status) => status.charAt(0) + status.slice(1).toLowerCase()

function StatusBadge({ status, label, dot = true }) {
  if (!status) return null
  return <span className={`status-badge ${TONES[status] ?? 'tone-slate'} ${dot ? '' : 'no-dot'}`}>{label ?? toLabel(status)}</span>
}

export default StatusBadge
