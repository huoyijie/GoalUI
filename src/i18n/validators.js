import * as validators from '@vuelidate/validators';
import i18n from '.';

const { createI18nMessage } = validators;

const withI18nMessage = createI18nMessage({ t: i18n.global.t.bind(i18n) });

// wrap each validator.
export const required = withI18nMessage(validators.required);
// validators that expect a parameter should have `{ withArguments: true }` passed as a second parameter, to annotate they should be wrapped
export const minLength = withI18nMessage(validators.minLength, { withArguments: true });

export const maxLength = withI18nMessage(validators.maxLength, { withArguments: true });

export const minValue = withI18nMessage(validators.minValue, { withArguments: true });

export const maxValue = withI18nMessage(validators.maxValue, { withArguments: true });

export const alphaNum = withI18nMessage(validators.alphaNum);

export const alpha = withI18nMessage(validators.alpha);

export const email = withI18nMessage(validators.email);

export const sameAs = withI18nMessage(validators.sameAs, { withArguments: true });
