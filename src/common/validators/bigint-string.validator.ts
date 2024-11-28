import { isNumberString } from 'class-validator';

const MAX_BIGINT = '9223372036854775807';
const MAX_BIGINT_LENGTH = 19;

export const validateBigIntIdString = (value: string): boolean => {
  if (!isNumericString(value) || hasLeadingZero(value)) {
    return false;
  }

  if (exceedsMaxLength(value)) {
    return false;
  }

  if (value.length === MAX_BIGINT_LENGTH && exceedsMaxValue(value)) {
    return false;
  }

  return true;
};

const isNumericString = (value: string): boolean => {
  return isNumberString(value, { no_symbols: true });
};

const hasLeadingZero = (value: string): boolean => {
  return value.startsWith('0');
};

const exceedsMaxLength = (value: string): boolean => {
  return value.length > MAX_BIGINT_LENGTH;
};

const exceedsMaxValue = (value: string): boolean => {
  return value > MAX_BIGINT;
};
