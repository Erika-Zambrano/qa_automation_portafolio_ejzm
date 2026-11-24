import { useLang } from '../../context/LangContext';

type Props = { page: number; totalPages: number; onChange: (page: number) => void };

export function Pagination({ page, totalPages, onChange }: Props) {
  const { t } = useLang();
  return (
    <nav className="pg-pagination" aria-label="Pagination" data-testid="pagination">
      <button type="button" className="pg-btn secondary" disabled={page <= 1} data-testid="page-prev" onClick={() => onChange(page - 1)}>
        {t('pg-prev')}
      </button>
      <span data-testid="page-current">
        {t('pg-page')} {page} {t('pg-of')} {totalPages}
      </span>
      <button type="button" className="pg-btn secondary" disabled={page >= totalPages} data-testid="page-next" onClick={() => onChange(page + 1)}>
        {t('pg-next')}
      </button>
    </nav>
  );
}
