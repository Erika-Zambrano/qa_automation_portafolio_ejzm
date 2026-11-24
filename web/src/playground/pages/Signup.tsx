import { useState, type FormEvent } from 'react';
import { Button, Input } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { api, ApiFailure, errorMessage, fieldErrors } from '../api';
import { useAuth } from '../AuthContext';
import { FormField } from '../components/FormField';
import { FormStatus } from '../components/FormStatus';
import { PasswordInput } from '../components/PasswordInput';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { TermsCheckbox } from '../components/TermsCheckbox';
import type { SessionUser } from '../types';

export function Signup() {
  const { t, withLang } = useLang();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [created, setCreated] = useState(false);
  const [sending, setSending] = useState(false);

  const update = (field: keyof typeof values) => (value: string) => setValues((prev) => ({ ...prev, [field]: value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setFailure(null);
    setErrors({});
    try {
      const { data } = await api<{ user: SessionUser; token: string }>('/auth/register', {
        method: 'POST',
        body: { ...values, acceptTerms: accepted },
      });
      signIn(data.token, data.user);
      setCreated(true);
      setTimeout(() => navigate(withLang('/playground/shop')), 1200);
    } catch (error) {
      setFailure(error as ApiFailure);
      setErrors(fieldErrors(error, t));
    } finally {
      setSending(false);
    }
  }

  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <PlaygroundLayout title="pg-signup-title" desc="pg-signup-desc" testId="playground-signup">
      <form id="signup-form" noValidate onSubmit={onSubmit} className="pg-form" data-testid="signup-form">
        <FormField name="name" label={t('pg-f-name')} error={errors.name} required>
          <Input id="name" name="name" autoComplete="name" bg="white" value={values.name} data-testid="input-name" onChange={(e) => update('name')(e.target.value)} />
        </FormField>
        <FormField name="email" label={t('pg-f-email')} error={errors.email} required>
          <Input id="email" name="email" type="email" autoComplete="email" bg="white" value={values.email} data-testid="input-email" onChange={(e) => update('email')(e.target.value)} />
        </FormField>
        <FormField name="password" label={t('pg-f-password')} error={errors.password} hint={t('pg-password-rules')} required>
          <PasswordInput name="password" autoComplete="new-password" value={values.password} onChange={update('password')} />
        </FormField>
        <FormField name="confirmPassword" label={t('pg-f-confirm')} error={errors.confirmPassword} required>
          <PasswordInput name="confirmPassword" autoComplete="new-password" value={values.confirmPassword} onChange={update('confirmPassword')} />
        </FormField>
        <TermsCheckbox checked={accepted} onChange={setAccepted} error={errors.acceptTerms} />
        <p className="pg-muted">{t('pg-signup-note')}</p>
        <Button type="submit" colorPalette="teal" loading={sending} loadingText={t('pg-signing-up')} data-testid="signup-submit">
          {t('pg-signup-submit')}
        </Button>
        {created && <FormStatus kind="success" text={t('pg-signup-ok')} testId="signup-success" />}
        {failure && (
          <FormStatus
            kind="error"
            text={hasFieldErrors && failure.code === 'VALIDATION_ERROR' ? t('pg-err-VALIDATION_ERROR') : errorMessage(failure, t)}
            requestId={failure.requestId}
            testId="signup-error"
          />
        )}
        <p className="pg-muted">
          {t('pg-have-account')} <Link to={withLang('/playground/login')} data-testid="link-login">{t('pg-nav-login')}</Link>
        </p>
      </form>
    </PlaygroundLayout>
  );
}
