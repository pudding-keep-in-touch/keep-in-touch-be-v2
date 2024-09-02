import { BaseResponseDto } from '@common/common.dto';
import { HttpStatus } from '@nestjs/common';

export function response<T>(data: T, message = '성공', status: number = HttpStatus.OK) {
  return {
    result: true,
    status,
    message,
    data,
  } satisfies BaseResponseDto<T>;
}
