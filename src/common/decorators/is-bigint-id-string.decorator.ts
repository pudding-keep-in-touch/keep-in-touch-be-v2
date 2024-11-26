import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

import { validateBigIntIdString } from '@common/validators/bigint-string.validator';

@ValidatorConstraint({ name: 'isBigIntIdString', async: false })
export class IsBigIntIdStringConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return validateBigIntIdString(value);
  }

  defaultMessage() {
    return 'Value must be a valid BigInt string';
  }
}

/**
 * class validator에서 사용할 BigInt string 유효성 검사 데코레이터
 *
 * @param validationOptions
 * @returns
 */
export function IsBigIntIdString(validationOptions?: ValidationOptions) {
  return (obj: object, propertyName: string) => {
    registerDecorator({
      name: 'isBigIntIdString',
      target: obj.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsBigIntIdStringConstraint,
    });
  };
}
