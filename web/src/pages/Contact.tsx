import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Field, Input, Stack, Textarea } from '@chakra-ui/react';
import { Html } from '../components/Html';
import { useLang } from '../context/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import '../css/contact.css';

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;
type Status = { kind: 'success' | 'error'; text: string } | null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCESS_KEY = '57dcf9ff-73a7-4422-89f6-f57300e51b13';
const empty: Values = { name: '', email: '', message: '' };

export function Contact() {
  const { t } = useLang();
  usePageTitle(`${t('contact-label')} — Erika Zambrano`);

  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  const update = (field: keyof Values) => (value: string) => setValues((prev) => ({ ...prev, [field]: value }));

  function validate(): Errors {
    const next: Errors = {};
    if (values.name.trim() === '') next.name = t('field-error-name');
    if (!EMAIL_REGEX.test(values.email.trim())) next.email = t('field-error-email');
    if (values.message.trim().length < 10) next.message = t('field-error-message');
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    try {
      const body = new FormData();
      body.append('access_key', ACCESS_KEY);
      body.append('subject', t('form-subject'));
      body.append('redirect', 'false');
      Object.entries(values).forEach(([key, value]) => body.append(key, value));
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStatus({ kind: 'success', text: t('form-success') });
      setValues(empty);
    } catch {
      setStatus({ kind: 'error', text: t('form-error') });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-wrapper">
        <Html as="p" k="contact-label" className="page-label" />
        <Html as="h1" k="contact-title" className="page-title" />
        <Html as="p" k="contact-desc" className="page-desc" />

        <Box className="chakra-scope">
          <form id="contact-form" onSubmit={onSubmit} noValidate>
            <Stack gap="5">
              <Field.Root required invalid={!!errors.name}>
                <Field.Label htmlFor="name">{t('form-label-name')}</Field.Label>
                <Input id="name" name="name" autoComplete="name" bg="white" value={values.name}
                  placeholder={t('form-placeholder-name')} onChange={(e) => update('name')(e.target.value)} />
                <Field.ErrorText>{errors.name}</Field.ErrorText>
              </Field.Root>

              <Field.Root required invalid={!!errors.email}>
                <Field.Label htmlFor="email">{t('form-label-email')}</Field.Label>
                <Input id="email" name="email" type="email" autoComplete="email" bg="white" value={values.email}
                  placeholder={t('form-placeholder-email')} onChange={(e) => update('email')(e.target.value)} />
                <Field.ErrorText>{errors.email}</Field.ErrorText>
              </Field.Root>

              <Field.Root required invalid={!!errors.message}>
                <Field.Label htmlFor="message">{t('form-label-message')}</Field.Label>
                <Textarea id="message" name="message" rows={5} bg="white" value={values.message}
                  placeholder={t('form-placeholder-message')} onChange={(e) => update('message')(e.target.value)} />
                <Field.ErrorText>{errors.message}</Field.ErrorText>
              </Field.Root>

              <Button type="submit" id="form-submit-btn" colorPalette="teal" loading={sending} loadingText={t('form-sending')}>
                {t('form-submit')}
              </Button>

              {status && (
                <Alert.Root status={status.kind === 'success' ? 'success' : 'error'} aria-live="polite" id="form-status">
                  <Alert.Indicator />
                  <Alert.Title>{status.text}</Alert.Title>
                </Alert.Root>
              )}
            </Stack>
          </form>
        </Box>
      </div>
    </div>
  );
}
