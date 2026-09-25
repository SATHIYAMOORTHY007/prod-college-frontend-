import {
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  FileLock2,
  FileSpreadsheet,
  History,
  KeyRound,
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  UserCog,
} from 'lucide-react'

/*
 * Copy for the public homepage. Every capability listed here maps to
 * something the backend implements today (see src/constants and the
 * backend services); keep it that way when editing. Each fact appears in
 * one section only.
 */

export const NAV_LINKS = [
  { href: '#top', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#roles', label: 'Roles' },
  { href: '#security', label: 'Security' },
  { href: '#faq', label: 'FAQ' },
]

/** How each record is kept today, and where it lives once the portal replaces it. */
export const PROBLEMS = [
  {
    icon: FileSpreadsheet,
    label: 'Marks',
    before: 'Spreadsheets passed between examiners',
    after: 'Entered once, against each subject',
  },
  {
    icon: Mail,
    label: 'Approvals',
    before: 'Email threads and signed printouts',
    after: 'Reviewed and signed off in the portal',
  },
  {
    icon: ClipboardList,
    label: 'Attendance',
    before: 'Paper registers counted by hand',
    after: 'Marked per class, totalled automatically',
  },
]

export const RESULT_STAGES = [
  {
    status: 'DRAFT',
    owner: 'Examiner',
    title: 'Examiner enters marks',
    text: 'Marks are recorded per subject against each subject’s maximum and pass marks. Drafts stay editable.',
    event: 'Marks entered by Dr. Priya Raman',
  },
  {
    status: 'SUBMITTED',
    owner: 'Examiner',
    title: 'Submitted for review',
    text: 'Submitting locks the marks. Nobody can edit them while the principal reviews.',
    event: 'Submitted for approval · marks locked',
  },
  {
    status: 'APPROVED',
    owner: 'Principal',
    title: 'Principal approves',
    text: 'The principal approves — or sends the result back to the examiner with a note explaining what to fix.',
    event: 'Approved by Dr. R. Venkatesan',
  },
  {
    status: 'PUBLISHED',
    owner: 'Principal',
    title: 'Published to the student',
    text: 'Only now can the student see it. They are notified in the portal, and the result becomes final.',
    event: 'Published · student notified',
  },
]

export const SECURITY = [
  {
    icon: ShieldCheck,
    title: 'Permission-checked APIs',
    text: 'Every route checks a permission, and the role is re-read from the database on each request.',
  },
  {
    icon: Lock,
    title: 'Ownership checks',
    text: 'Students are scoped to their own records. Requests for anyone else’s are refused.',
  },
  {
    icon: KeyRound,
    title: 'Hashed passwords',
    text: 'Stored with bcrypt. Sign-in errors never reveal whether an account exists.',
  },
  {
    icon: History,
    title: 'Rotating sessions',
    text: 'Short-lived tokens in memory and httpOnly refresh cookies. A replayed token revokes the session.',
  },
  {
    icon: Layers,
    title: 'Hardened endpoints',
    text: 'Rate-limited sign-in and password reset, validated input and secure HTTP headers.',
  },
  {
    icon: FileLock2,
    title: 'Recorded overrides',
    text: 'When an admin acts for an examiner or principal, the audit log flags it.',
  },
]

export const STEPS = [
  { title: 'Set up the structure', text: 'Create departments, courses and subjects once.' },
  { title: 'Add people', text: 'Create staff accounts and enrol students — each with a role.' },
  { title: 'Run the term', text: 'Schedule exams, take attendance and enter marks.' },
  { title: 'Release results', text: 'Approve and publish. Students are told instantly.' },
]

export const FAQS = [
  {
    icon: KeyRound,
    topic: 'Access',
    q: 'Who can sign in, and how?',
    a: 'Administrators, principals, examiners and students, using accounts created by the college. Staff sign in with their college email; students can also use their roll number. Forgotten passwords are reset through an emailed link.',
  },
  {
    icon: UserCog,
    topic: 'Roles',
    q: 'What happens if an examiner is absent?',
    a: 'An administrator can enter and submit marks on their behalf. The action is allowed, but it is flagged as an admin override in the audit log.',
  },
  {
    icon: FileLock2,
    topic: 'Results',
    q: 'Can a published result be corrected?',
    a: 'No. Publication is the final step and published results cannot be edited. Mistakes are meant to be caught at review, where the principal can send marks back before approving.',
  },
  {
    icon: CalendarCheck,
    topic: 'Attendance',
    q: 'How is attendance calculated?',
    a: 'Each class is recorded as present or absent for a subject on a date. The percentage is present classes over recorded classes, per subject, and anything below 75% is highlighted.',
  },
  {
    icon: Layers,
    topic: 'Academics',
    q: 'How are semesters handled?',
    a: 'Each course defines how many semesters it has, up to eight. Students, subjects, exams and attendance are all tied to a semester, so records stay separated term by term.',
  },
  {
    icon: CalendarClock,
    topic: 'Exams',
    q: 'Which types of exams are supported?',
    a: 'Internal assessments, end-semester examinations and practicals. Each exam belongs to one course and semester, covers one or more subjects and has an assigned examiner.',
  },
]
