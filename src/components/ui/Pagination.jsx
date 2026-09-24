import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Page numbers with ellipses: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const result = []
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) result.push('gap-' + p)
    result.push(p)
  })
  return result
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination) return null
  const { page, limit, total, totalPages } = pagination
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="table-footer">
      <span className="tabular">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
      </span>
      {totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button type="button" className="pager-btn" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          {pageWindow(page, totalPages).map((item) =>
            typeof item === 'string' ? (
              <span key={item} className="px-1 text-soft">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`pager-btn ${item === page ? 'active' : ''}`}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}
          <button type="button" className="pager-btn" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  )
}

export default Pagination
