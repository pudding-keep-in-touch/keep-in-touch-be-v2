import { validateBigIntIdString } from '@common/validators/bigint-string.validator';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

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
    if (validateBigIntIdString(value) === false) {
      throw new BadRequestException('Invalid bigint id');
    }

    return value;
  }
}
