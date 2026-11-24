import { Alert } from '@chakra-ui/react';
import { useLang } from '../../context/LangContext';

type Props = { kind: 'success' | 'error'; text: string; requestId?: string; testId?: string };

export function FormStatus({ kind, text, requestId, testId = 'form-status' }: Props) {
  const { t } = useLang();
  return (
    <Alert.Root status={kind} aria-live="polite" data-testid={testId}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title data-testid={`${testId}-text`}>{text}</Alert.Title>
        {requestId && (
          <Alert.Description>
            {t('pg-request-id')}: <code data-testid={`${testId}-request-id`}>{requestId}</code>
          </Alert.Description>
        )}
      </Alert.Content>
    </Alert.Root>
  );
}
