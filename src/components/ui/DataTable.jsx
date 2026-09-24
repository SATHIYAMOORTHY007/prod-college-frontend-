import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from './States'

/**
 * Presentational table driven by a column config. Data fetching,
 * sorting and paging happen on the server; this component only renders.
 *
 * @param {{
 *   columns: Array<{ key: string, header: string, render?: (row) => any, sortable?: boolean, className?: string }>,
 *   rows: any[], isLoading?: boolean, error?: any, onRetry?: () => void,
 *   sort?: { sortBy?: string, sortOrder?: 'asc'|'desc' }, onSortChange?: (sortBy, sortOrder) => void,
 *   selectable?: boolean, selectedIds?: Set<string>, onSelectionChange?: (ids: Set<string>) => void,
 *   isRowSelectable?: (row) => boolean, empty?: import('react').ReactNode, rowKey?: string
 * }} props
 */
function DataTable({
  columns,
  rows = [],
  isLoading,
  error,
  onRetry,
  sort,
  onSortChange,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  isRowSelectable = () => true,
  empty,
  rowKey = 'id',
}) {
  if (isLoading) return <LoadingState rows={6} />
  if (error) return <ErrorState error={error} onRetry={onRetry} />
  if (!rows.length) return empty ?? <EmptyState title="No records found" message="Try changing your search or filters." />

  const selectableRows = rows.filter(isRowSelectable)
  const allSelected = selectableRows.length > 0 && selectableRows.every((row) => selectedIds.has(row[rowKey]))

  const toggleAll = () => {
    const next = new Set(selectedIds)
    selectableRows.forEach((row) => (allSelected ? next.delete(row[rowKey]) : next.add(row[rowKey])))
    onSelectionChange?.(next)
  }
  const toggleRow = (id) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    onSelectionChange?.(next)
  }

  const handleSort = (key) => {
    const nextOrder = sort?.sortBy === key && sort?.sortOrder === 'asc' ? 'desc' : 'asc'
    onSortChange?.(key, nextOrder)
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover data-table">
        <thead>
          <tr>
            {selectable && (
              <th className="col-select">
                <input type="checkbox" className="form-check-input" checked={allSelected} onChange={toggleAll} aria-label="Select all rows" />
              </th>
            )}
            {columns.map((column) => (
              <th key={column.key} className={column.className} aria-sort={sort?.sortBy === column.key ? `${sort.sortOrder}ending` : undefined}>
                {column.sortable && onSortChange ? (
                  <button type="button" className="sort-button" onClick={() => handleSort(column.key)}>
                    {column.header}
                    {sort?.sortBy === column.key ? (
                      sort.sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-50" />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {selectable && (
                <td className="col-select">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedIds.has(row[rowKey])}
                    disabled={!isRowSelectable(row)}
                    onChange={() => toggleRow(row[rowKey])}
                    aria-label="Select row"
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
