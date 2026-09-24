import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'

/**
 * Search box that reports changes only after the user pauses typing,
 * so the list query is not re-run on every keystroke.
 */
function SearchInput({ value = '', onSearch, placeholder = 'Search…', delay = 400, className = '' }) {
  const [text, setText] = useState(value)
  const debounced = useDebounce(text, delay)
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch

  // Keep in sync when the URL changes from outside (e.g. "Clear filters").
  useEffect(() => setText(value), [value])

  useEffect(() => {
    if (debounced.trim() !== value) onSearchRef.current(debounced.trim())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className={`input-icon ${className}`}>
      <Search size={16} />
      <input
        type="search"
        className="form-control"
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-label={placeholder}
      />
      {text && (
        <button
          type="button"
          className="btn btn-ghost btn-icon position-absolute top-50 end-0 translate-middle-y me-1"
          onClick={() => setText('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default SearchInput
