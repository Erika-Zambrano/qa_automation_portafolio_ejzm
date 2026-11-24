import { useState, type FormEvent } from 'react';
import { Button, Input } from '@chakra-ui/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { api, ApiFailure, errorMessage, fieldErrors } from '../api';
import { useAuth } from '../AuthContext';
import { FormField } from '../components/FormField';
import { FormStatus } from '../components/FormStatus';
import { PasswordInput } from '../components/PasswordInput';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import type { SessionUser } from '../types';

export function Login() {
  const { t, withLang } = useLang();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setFailure(null);
    setErrors({});
    try {
      const { data } = await api<{ user: SessionUser; token: string }>('/auth/login', { method: 'POST', body: { email, password } });
      signIn(data.token, data.user);
      navigate(withLang(params.get('next') ?? '/playground/shop'));
    } catch (error) {
      setFailure(error as ApiFailure);
      setErrors(fieldErrors(error, t));
    } finally {
      setSending(false);
    }
  }

  return (
    <PlaygroundLayout title="pg-login-title" desc="pg-login-desc" testId="playground-login">
      <form id="login-form" noValidate onSubmit={onSubmit} className="pg-form" data-testid="login-form">
        <FormField name="email" label={t('pg-f-email')} error={errors.email} required>
          <Input id="email" name="email" type="email" autoComplete="email" bg="white" value={email} data-testid="input-email" onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField name="password" label={t('pg-f-password')} error={errors.password} required>
          <PasswordInput name="password" autoComplete="current-password" value={password} onChange={setPassword} />
        </FormField>
        <p className="pg-muted">{t('pg-login-hint')}</p>
        <Button type="submit" colorPalette="teal" loading={sending} loadingText={t('pg-logging-in')} data-testid="login-submit">
          {t('pg-login-submit')}
        </Button>
        {failure && Object.keys(errors).length === 0 && (
          <FormStatus kind="error" text={errorMessage(failure, t)} requestId={failure.requestId} testId="login-error" />
        )}
        {failure && Object.keys(errors).length > 0 && (
          <FormStatus kind="error" text={t('pg-err-VALIDATION_ERROR')} requestId={failure.requestId} testId="login-error" />
        )}
        <p className="pg-muted">
          {t('pg-login-no-account')} <Link to={withLang('/playground/signup')} data-testid="link-signup">{t('pg-nav-signup')}</Link>
        </p>
      </form>
    </PlaygroundLayout>
  );
}
