import { pgEs, type PgKey } from '../../../web/src/i18n/playground';

export const buttonName = {
  addToCart: pgEs['pg-add' satisfies PgKey],
  login: pgEs['pg-login-submit' satisfies PgKey],
  signup: pgEs['pg-signup-submit' satisfies PgKey],
  sendRequest: pgEs['pg-forms-submit' satisfies PgKey],
} as const;

export const messages = {
  termsRequired: pgEs['pg-vf-TERMS_NOT_ACCEPTED' satisfies PgKey],
  invalidCredentials: pgEs['pg-err-INVALID_CREDENTIALS' satisfies PgKey],
  accountLocked: pgEs['pg-err-ACCOUNT_LOCKED' satisfies PgKey],
  cardDeclined: pgEs['pg-err-CARD_DECLINED' satisfies PgKey],
  insufficientFunds: pgEs['pg-err-INSUFFICIENT_FUNDS' satisfies PgKey],
  insufficientStock: pgEs['pg-err-INSUFFICIENT_STOCK' satisfies PgKey],
} as const;
