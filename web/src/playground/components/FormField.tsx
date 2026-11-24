import type { ReactNode } from 'react';
import { Field } from '@chakra-ui/react';

type Props = { name: string; label: string; error?: string; hint?: string; required?: boolean; children: ReactNode };

export function FormField({ name, label, error, hint, required, children }: Props) {
  return (
    <Field.Root required={required} invalid={!!error}>
      <Field.Label htmlFor={name}>{label}</Field.Label>
      {children}
      {hint && !error && <Field.HelperText>{hint}</Field.HelperText>}
      <Field.ErrorText data-testid={`error-${name}`}>{error}</Field.ErrorText>
    </Field.Root>
  );
}

type GroupProps = { name: string; legend: string; error?: string; children: ReactNode };

export function ChoiceGroup({ name, legend, error, children }: GroupProps) {
  return (
    <fieldset className={`pg-fieldset${error ? ' invalid' : ''}`} data-testid={`group-${name}`}>
      <legend>{legend}</legend>
      <div className="pg-choices">{children}</div>
      {error && (
        <p className="pg-error" role="alert" data-testid={`error-${name}`}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
