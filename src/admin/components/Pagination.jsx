import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, pageCount)
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, total)

  const pages = []
  const from = Math.max(1, Math.min(safePage - 1, pageCount - 4))
  const to = Math.min(pageCount, from + 4)
  for (let index = from; index <= to; index += 1) pages.push(index)

  return (
    <div className="adm-pagination">
      <p className="adm-pagination__summary">
        Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{total}</strong>
      </p>
      <div className="adm-pagination__controls">
        <button
          type="button"
          className="adm-page-btn"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        {from > 1 && <span className="adm-pagination__ellipsis">…</span>}
        {pages.map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            className={`adm-page-btn ${pageNumber === safePage ? 'is-active' : ''}`}
            onClick={() => onPageChange(pageNumber)}
            aria-current={pageNumber === safePage ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        ))}
        {to < pageCount && <span className="adm-pagination__ellipsis">…</span>}
        <button
          type="button"
          className="adm-page-btn"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
