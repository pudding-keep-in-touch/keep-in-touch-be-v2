import { isNumberString } from 'class-validator';

const MAX_BIGINT = '9223372036854775807';
const MAX_BIGINT_LENGTH = 19;

export const validateBigIntIdString = (value: string): boolean => {
  return isNumericString(value) && !hasLeadingZero(value) && !exceedsMaxLength(value) && !exceedsMaxValue(value);
};

const isNumericString = (value: string): boolean => {
  return isNumberString(value, { no_symbols: true }); // 숫자 문자열 확인
};

const hasLeadingZero = (value: string): boolean => {
  return value.startsWith('0'); // 선행 0 확인
};

const exceedsMaxLength = (value: string): boolean => {
  return value.length > MAX_BIGINT_LENGTH; // 길이 초과 확인
};

const exceedsMaxValue = (value: string): boolean => {
  return value > MAX_BIGINT; // 최대값 초과 확인
};
