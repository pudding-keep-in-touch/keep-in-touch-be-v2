import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsValidTemplateIdsConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!Array.isArray(value)) {
      args.constraints[0].failReason = 'templateIds는 배열이어야 합니다.';
      return false;
    }

    // 1. 배열 크기 검사
    if (value.length < 1 || value.length > 5) {
      args.constraints[0].failReason = '1개에서 5개 사이의 templateId값을 입력해주세요.';
    }

    // 2. 각 요소가 숫자 형태의 문자열인지 검사
    if (!value.every((item) => typeof item === 'string' && /^\d+$/.test(item))) {
      args.constraints[0].failReason = 'templateId값은 숫자 형태의 문자열이어야 합니다.';
      return false;
    }

    // 3. 중복값 검사
    const uniqueSet = new Set(value);
    if (uniqueSet.size !== value.length) {
      args.constraints[0].failReason = '중복된 templateId값이 있습니다.';
      return false;
    }
    return true;
  }

  defaultMessage(): string {
    return 'templateIds는 1~5개의 숫자 형태의 문자열로 구성된 배열이어야 합니다.';
  }
}

export function IsValidTemplateIds(validationOptions?: ValidationOptions) {
  return (obj: object, propertyName: string) => {
    registerDecorator({
      name: 'isValidTemplateIds',
      target: obj.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidTemplateIdsConstraint,
      constraints: [{ failReason: '' }], //  constraints defined by specific validation type
    });
  };
}
