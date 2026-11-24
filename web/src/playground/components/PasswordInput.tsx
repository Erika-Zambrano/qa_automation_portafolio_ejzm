import { useState } from 'react';
import { Input } from '@chakra-ui/react';
import { useLang } from '../../context/LangContext';

type Props = { name: string; value: string; onChange: (value: string) => void; autoComplete: string };

export function PasswordInput({ name, value, onChange, autoComplete }: Props) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  return (
    <div className="pg-password">
      <Input
        id={name}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        bg="white"
        value={value}
        data-testid={`input-${name}`}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="pg-link pg-password-toggle"
        aria-pressed={visible}
        aria-controls={name}
        data-testid={`toggle-${name}`}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? t('pg-hide') : t('pg-show')}
      </button>
    </div>
  );
}
