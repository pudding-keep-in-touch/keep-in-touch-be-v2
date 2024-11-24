import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isNumberString } from 'class-validator';

const MAX_BIGINT = '9223372036854775807';
const MAX_BIGINT_LENGTH = 19;

/**
 * 숫자 형식이 아니면 error
 * -, +, . 기호가 있으면 error (자연수 only)
 * 앞에 0 padding이 붙으면 error ex) "000123"
 * bigint 범위를 넘어가면 error
 *
 * @description string 형식의 bigint id를 검증하는 파이프
 */
@Injectable()
export class CheckBigIntIdPipe implements PipeTransform {
  transform(value: string) {
    if (this.isBigIntString(value) === false) {
      throw new BadRequestException('Invalid id format');
    }

    return value;
  }

  private isBigIntString(value: string): boolean {
    return (
      this.isNumericString(value) &&
      !this.hasLeadingZero(value) &&
      !this.exceedsMaxLength(value) &&
      !this.exceedsMaxValue(value)
    );
  }

  private isNumericString(value: string): boolean {
    return isNumberString(value, { no_symbols: true }); // 숫자 문자열 확인
  }

  private hasLeadingZero(value: string): boolean {
    return value.startsWith('0'); // 선행 0 확인
  }

  private exceedsMaxLength(value: string): boolean {
    return value.length > MAX_BIGINT_LENGTH; // 길이 초과 확인
  }

  private exceedsMaxValue(value: string): boolean {
    return value > MAX_BIGINT; // 최대값 초과 확인
  }
}
