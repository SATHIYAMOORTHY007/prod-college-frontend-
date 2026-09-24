import { useEffect, useMemo, useState } from 'react'
import { CheckCheck, Save, Users } from 'lucide-react'
import { Button, EmptyState, ErrorState, Input, LoadingState, PageHeader, Select } from '../../components/ui'
import { SECTION_OPTIONS } from '../../constants/semesters'
import { toDateInputValue } from '../../utils/format'
import { useCourseOptions, useSemesterOptions, useSubjects } from '../courses/useCourses'
import { useAttendanceSheet, useMarkAttendance } from './useAttendance'

function AttendanceToggle({ value, onChange, label }) {
  return (
    <div className="attendance-toggle" role="radiogroup" aria-label={label}>
      <button type="button" role="radio" aria-checked={value === 'PRESENT'} className={value === 'PRESENT' ? 'is-present' : ''} onClick={() => onChange('PRESENT')}>
        Present
      </button>
      <button type="button" role="radio" aria-checked={value === 'ABSENT'} className={value === 'ABSENT' ? 'is-absent' : ''} onClick={() => onChange('ABSENT')}>
        Absent
      </button>
    </div>
  )
}

function MarkAttendancePage() {
  const today = toDateInputValue()
  const [course, setCourse] = useState('')
  const [semester, setSemester] = useState('')
  const [subject, setSubject] = useState('')
  const [section, setSection] = useState('')
  const [date, setDate] = useState(today)
  const [statuses, setStatuses] = useState({})

  const { options: courseOptions } = useCourseOptions()
  const semesterOptions = useSemesterOptions(course)
  const { data: subjects = [] } = useSubjects(course || undefined, semester || undefined)
  const sheetParams = { subject, date, section: section || undefined }
  const { data: sheet, isLoading, error, refetch } = useAttendanceSheet(sheetParams)
  const markAttendance = useMarkAttendance()

  // Start from what is already saved; unmarked students default to present.
  useEffect(() => {
    if (sheet) setStatuses(Object.fromEntries(sheet.students.map((s) => [s.id, s.status ?? 'PRESENT'])))
  }, [sheet])

  const counts = useMemo(() => {
    const values = Object.values(statuses)
    return { present: values.filter((v) => v === 'PRESENT').length, absent: values.filter((v) => v === 'ABSENT').length }
  }, [statuses])

  const save = () =>
    markAttendance.mutate({
      subject,
      date,
      records: Object.entries(statuses).map(([student, status]) => ({ student, status })),
    })

  return (
    <>
      <PageHeader title="Mark attendance" subtitle="Record attendance for one subject and day. Saving again updates the day’s record." />

      <div className="surface mb-3">
        <div className="surface-body row g-3">
          <Select containerClassName="col-md-4" label="Course" placeholder="Select a course" options={courseOptions} value={course} onChange={(e) => { setCourse(e.target.value); setSubject('') }} />
          <Select containerClassName="col-md-2" label="Semester" placeholder="—" options={semesterOptions} value={semester} onChange={(e) => { setSemester(e.target.value); setSubject('') }} />
          <Select
            containerClassName="col-md-3"
            label="Subject"
            placeholder={course && semester ? 'Select a subject' : 'Pick course & semester'}
            options={subjects.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))}
            value={subject}
            disabled={!course || !semester}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Select containerClassName="col-md-1" label="Section" placeholder="All" options={SECTION_OPTIONS.map((o) => ({ ...o, label: o.value }))} value={section} onChange={(e) => setSection(e.target.value)} />
          <Input containerClassName="col-md-2" type="date" label="Date" max={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="surface">
        {!subject ? (
          <EmptyState icon={Users} title="Choose a class" message="Select the course, semester and subject to load the class list." />
        ) : isLoading ? (
          <LoadingState rows={6} />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : sheet.students.length === 0 ? (
          <EmptyState title="No students in this class" />
        ) : (
          <>
            <div className="table-toolbar">
              <div>
                <strong>{sheet.subject.code}</strong> · {sheet.subject.name}
                {sheet.alreadyMarked && <span className="status-badge tone-sky ms-2">Already marked — editing</span>}
              </div>
              <div className="ms-auto d-flex align-items-center gap-3">
                <span className="small">
                  <span className="text-success fw-semibold">{counts.present} present</span> ·{' '}
                  <span className="text-danger fw-semibold">{counts.absent} absent</span>
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={CheckCheck}
                  onClick={() => setStatuses(Object.fromEntries(sheet.students.map((s) => [s.id, 'PRESENT'])))}
                >
                  All present
                </Button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table data-table align-middle">
                <thead>
                  <tr>
                    <th>Roll no.</th>
                    <th>Name</th>
                    <th>Section</th>
                    <th className="text-end">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.students.map((student) => (
                    <tr key={student.id}>
                      <td className="fw-semibold tabular">{student.rollNo}</td>
                      <td>{student.name}</td>
                      <td>{student.section}</td>
                      <td className="text-end">
                        <AttendanceToggle
                          label={`Attendance for ${student.name}`}
                          value={statuses[student.id]}
                          onChange={(status) => setStatuses((current) => ({ ...current, [student.id]: status }))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>{sheet.students.length} students</span>
              <Button icon={Save} onClick={save} loading={markAttendance.isPending}>
                Save attendance
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default MarkAttendancePage
