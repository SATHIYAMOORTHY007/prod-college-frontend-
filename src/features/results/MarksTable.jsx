import { StatusBadge } from '../../components/ui'
import { formatPercent } from '../../utils/format'

/**
 * Subject-wise marks, written so anyone can read it without help:
 * what was scored, out of how much, what the pass mark is, and why the
 * overall result is Passed or Failed.
 */
function MarksTable({ result }) {
  const failedSubjects = result.marks.filter((mark) => mark.score < mark.passMarks)

  return (
    <>
      <table className="table data-table mb-2">
        <thead>
          <tr>
            <th>Subject</th>
            <th className="text-end">Marks scored</th>
            <th className="text-end">Pass mark</th>
            <th className="text-end">Result</th>
          </tr>
        </thead>
        <tbody>
          {result.marks.map((mark) => {
            const passed = mark.score >= mark.passMarks
            return (
              <tr key={mark.subject.id}>
                <td className="py-2">
                  <div className="cell-primary">{mark.subject.name}</div>
                  <div className="cell-secondary">Code {mark.subject.code}</div>
                </td>
                <td className="text-end tabular py-2 text-nowrap">
                  <span className={`fw-bold ${passed ? '' : 'text-danger'}`}>{mark.score}</span>
                  <span className="text-muted-cp"> out of {mark.maxMarks}</span>
                </td>
                <td className="text-end tabular py-2 text-muted-cp">{mark.passMarks}</td>
                <td className="text-end py-2">
                  <StatusBadge status={passed ? 'PASS' : 'FAIL'} label={passed ? 'Pass' : 'Fail'} dot={false} />
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#f8fafc' }}>
            <td className="fw-semibold py-2">Total</td>
            <td className="text-end tabular py-2 text-nowrap">
              <span className="fw-bold">{result.totalScore}</span>
              <span className="text-muted-cp"> out of {result.totalMaxMarks}</span>
              <div className="small fw-semibold">{formatPercent(result.percentage)}</div>
            </td>
            <td />
            <td className="text-end py-2">
              <StatusBadge status={result.passed ? 'PASS' : 'FAIL'} label={result.passed ? 'Passed' : 'Failed'} />
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="small text-muted-cp mb-0">
        {failedSubjects.length
          ? `Failed because the marks in ${failedSubjects.map((m) => m.subject.code).join(', ')} are below the pass mark. `
          : 'Passed: every subject is at or above its pass mark. '}
        A student must reach the pass mark in <strong>every</strong> subject to pass overall.
      </p>
    </>
  )
}

export default MarksTable
