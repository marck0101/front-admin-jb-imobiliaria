import { usePagination } from '../../hooks/usePagination';

interface Props {
  onPageChange: (page: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
}

export function Pagination({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className = '',
}: Props) {
  // console.log('entrei aqui');

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  const lastPage = paginationRange[paginationRange.length - 1];

  return (
    <ol
      className={'flex justify-center gap-1 text-xs font-medium ' + className}
    >
      <li>
        <a
          href="#"
          style={{
            display: currentPage === 1 ? 'none' : 'flex',
          }}
          onClick={onPrevious}
          className="flex h-8 w-8 rounded-lg items-center justify-center border border-slate-300 bg-white text-slate-500 rtl:rotate-180"
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </a>
      </li>
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === 'DOTS') {
          return (
            <li
              key={index}
              className="select-none mx-1 flex items-end pb-1 text-slate-500 font-semibold"
            >
              <p>...</p>
            </li>
          );
        }
        return (
          <li key={index}>
            <button
              onClick={() => onPageChange(pageNumber)}
              className={
                pageNumber === currentPage
                  ? 'rounded-lg block h-8 w-8 bg-primary text-center leading-8 text-white'
                  : 'rounded-lg block h-8 w-8 border border-slate-300 shadow-sm bg-white text-center leading-8 text-slate-500'
              }
            >
              {pageNumber}
            </button>
          </li>
        );
      })}
      <li>
        <button
          style={{
            display: currentPage === lastPage ? 'none' : 'flex',
          }}
          onClick={onNext}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 rtl:rotate-180"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </li>
    </ol>
  );
}
