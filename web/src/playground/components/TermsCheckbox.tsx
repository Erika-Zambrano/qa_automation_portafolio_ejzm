import { useState } from 'react';
import { useLang } from '../../context/LangContext';

type Props = { checked: boolean; onChange: (checked: boolean) => void; error?: string };

export function TermsCheckbox({ checked, onChange, error }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <div className={`pg-terms${error ? ' invalid' : ''}`}>
      <div className="pg-choice">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          checked={checked}
          aria-invalid={!!error}
          aria-describedby={error ? 'error-acceptTerms' : undefined}
          data-testid="input-acceptTerms"
          onChange={(event) => onChange(event.target.checked)}
        />
        <label htmlFor="acceptTerms">
          {t('pg-terms-accept')}{' '}
          <button
            type="button"
            className="pg-link"
            aria-expanded={open}
            aria-controls="terms-panel"
            data-testid="terms-toggle"
            onClick={(event) => {
              event.preventDefault();
              setOpen((v) => !v);
            }}
          >
            {t('pg-terms-link')}
          </button>
        </label>
      </div>
      {open && (
        <div id="terms-panel" className="pg-terms-panel" role="region" aria-label={t('pg-terms-title')} data-testid="terms-panel">
          <strong>{t('pg-terms-title')}</strong>
          <p>{t('pg-terms-body')}</p>
        </div>
      )}
      {error && (
        <p id="error-acceptTerms" className="pg-error" role="alert" data-testid="error-acceptTerms">
          {error}
        </p>
      )}
    </div>
  );
}
