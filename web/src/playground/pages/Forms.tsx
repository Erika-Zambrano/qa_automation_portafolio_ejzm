import { useState, type FormEvent } from 'react';
import { Button, Input, Textarea } from '@chakra-ui/react';
import { useLang } from '../../context/LangContext';
import type { Translations } from '../../i18n/translations';
import { api, ApiFailure, errorMessage, fieldErrors } from '../api';
import { ChoiceGroup, FormField } from '../components/FormField';
import { FormStatus } from '../components/FormStatus';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { TermsCheckbox } from '../components/TermsCheckbox';
import { COUNTRIES, GENDERS, INTERESTS } from '../types';

const initial = {
  fullName: '',
  email: '',
  country: '',
  gender: '',
  interests: [] as string[],
  birthDate: '',
  collectingYears: '',
  message: '',
  newsletter: false,
  acceptTerms: false,
};

type Receipt = { id: string; receivedAt: string };

export function Forms() {
  const { t } = useLang();
  const [values, setValues] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [sending, setSending] = useState(false);

  const set = <K extends keyof typeof initial>(field: K) => (value: (typeof initial)[K]) => setValues((prev) => ({ ...prev, [field]: value }));

  function toggleInterest(interest: string) {
    set('interests')(values.interests.includes(interest) ? values.interests.filter((i) => i !== interest) : [...values.interests, interest]);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setFailure(null);
    setErrors({});
    const body: Record<string, unknown> = {
      fullName: values.fullName,
      email: values.email,
      country: values.country,
      gender: values.gender,
      interests: values.interests,
      birthDate: values.birthDate,
      newsletter: values.newsletter,
      acceptTerms: values.acceptTerms,
    };
    if (values.collectingYears !== '') body.collectingYears = Number(values.collectingYears);
    if (values.message !== '') body.message = values.message;
    if (file) body.attachment = { name: file.name, size: file.size, type: file.type };
    try {
      const { data } = await api<Receipt>('/forms/submit', { method: 'POST', body });
      setReceipt(data);
    } catch (error) {
      setFailure(error as ApiFailure);
      setErrors(fieldErrors(error, t));
    } finally {
      setSending(false);
    }
  }

  function startOver() {
    setValues(initial);
    setFile(null);
    setReceipt(null);
    setErrors({});
    setFailure(null);
  }

  if (receipt) {
    return (
      <PlaygroundLayout title="pg-forms-title" testId="playground-forms">
        <FormStatus kind="success" text={t('pg-forms-ok')} testId="forms-success" />
        <dl className="pg-data">
          <div>
            <dt>{t('pg-forms-id')}</dt>
            <dd><code data-testid="forms-receipt-id">{receipt.id}</code></dd>
          </div>
        </dl>
        <button type="button" className="pg-btn secondary" data-testid="forms-reset" onClick={startOver}>{t('pg-forms-reset')}</button>
      </PlaygroundLayout>
    );
  }

  return (
    <PlaygroundLayout title="pg-forms-title" desc="pg-forms-desc" testId="playground-forms">
      <form id="request-form" noValidate onSubmit={onSubmit} className="pg-form" data-testid="request-form">
        <FormField name="fullName" label={t('pg-f-fullname')} error={errors.fullName} required>
          <Input id="fullName" name="fullName" autoComplete="name" bg="white" value={values.fullName} data-testid="input-fullName" onChange={(e) => set('fullName')(e.target.value)} />
        </FormField>
        <FormField name="email" label={t('pg-f-email')} error={errors.email} required>
          <Input id="email" name="email" type="email" autoComplete="email" bg="white" value={values.email} data-testid="input-email" onChange={(e) => set('email')(e.target.value)} />
        </FormField>
        <FormField name="country" label={t('pg-f-country')} error={errors.country} required>
          <select id="country" name="country" className="pg-select" value={values.country} data-testid="input-country" onChange={(e) => set('country')(e.target.value)}>
            <option value="">{t('pg-select')}</option>
            {COUNTRIES.map((code) => (
              <option key={code} value={code}>{t(`pg-country-${code}` as keyof Translations)}</option>
            ))}
          </select>
        </FormField>

        <ChoiceGroup name="gender" legend={t('pg-f-gender')} error={errors.gender}>
          {GENDERS.map((gender) => (
            <div className="pg-choice" key={gender}>
              <input id={`gender-${gender}`} type="radio" name="gender" value={gender} checked={values.gender === gender} data-testid={`gender-${gender}`} onChange={() => set('gender')(gender)} />
              <label htmlFor={`gender-${gender}`}>{t(`pg-gender-${gender}` as keyof Translations)}</label>
            </div>
          ))}
        </ChoiceGroup>

        <ChoiceGroup name="interests" legend={t('pg-f-interests')} error={errors.interests}>
          {INTERESTS.map((interest) => (
            <div className="pg-choice" key={interest}>
              <input id={`interest-${interest}`} type="checkbox" name="interests" value={interest} checked={values.interests.includes(interest)} data-testid={`interest-${interest}`} onChange={() => toggleInterest(interest)} />
              <label htmlFor={`interest-${interest}`}>{t(`pg-interest-${interest}` as keyof Translations)}</label>
            </div>
          ))}
        </ChoiceGroup>

        <FormField name="birthDate" label={t('pg-f-birth')} error={errors.birthDate} required>
          <Input id="birthDate" name="birthDate" type="date" bg="white" value={values.birthDate} data-testid="input-birthDate" onChange={(e) => set('birthDate')(e.target.value)} />
        </FormField>
        <FormField name="collectingYears" label={t('pg-f-years')} error={errors.collectingYears} required>
          <Input id="collectingYears" name="collectingYears" type="number" min={0} max={60} bg="white" value={values.collectingYears} data-testid="input-collectingYears" onChange={(e) => set('collectingYears')(e.target.value)} />
        </FormField>
        <FormField name="message" label={t('pg-f-message')} error={errors.message} hint={`${values.message.length}/500`}>
          <Textarea id="message" name="message" rows={4} bg="white" value={values.message} data-testid="input-message" onChange={(e) => set('message')(e.target.value)} />
        </FormField>
        <FormField name="attachment" label={t('pg-f-attachment')} error={errors.attachment}>
          <input id="attachment" name="attachment" type="file" className="pg-file" data-testid="input-attachment" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </FormField>

        <div className="pg-choice">
          <input id="newsletter" name="newsletter" type="checkbox" role="switch" checked={values.newsletter} data-testid="input-newsletter" onChange={(e) => set('newsletter')(e.target.checked)} />
          <label htmlFor="newsletter">{t('pg-f-newsletter')}</label>
        </div>

        <TermsCheckbox checked={values.acceptTerms} onChange={set('acceptTerms')} error={errors.acceptTerms} />

        <Button type="submit" colorPalette="teal" loading={sending} loadingText={t('pg-forms-sending')} data-testid="forms-submit">
          {t('pg-forms-submit')}
        </Button>
        {failure && (
          <FormStatus
            kind="error"
            text={failure.code === 'VALIDATION_ERROR' ? t('pg-err-VALIDATION_ERROR') : errorMessage(failure, t)}
            requestId={failure.requestId}
            testId="forms-error"
          />
        )}
      </form>
    </PlaygroundLayout>
  );
}
