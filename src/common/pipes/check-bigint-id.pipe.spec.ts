import { BadRequestException } from '@nestjs/common';
import { CheckBigIntIdPipe } from './check-bigint-id.pipe';

describe('CheckBigIntIdPipe', () => {
  let pipe: CheckBigIntIdPipe;

  beforeEach(() => {
    pipe = new CheckBigIntIdPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('bigint string이 들어 왔을 때 통과', () => {
    expect(pipe.transform('1234567890123456789')).toBe('1234567890123456789');
  });

  it('non-numeric string일 때 error', () => {
    expect(() => pipe.transform('abc')).toThrow(BadRequestException);
  });

  it('empty string일 때 error', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });

  it('0으로 시작되는 값이 들어오면 error', () => {
    expect(() => pipe.transform('000000123456789')).toThrow(BadRequestException);
  });

  it('+, -, . 이 들어갔을 때 error', () => {
    expect(() => pipe.transform('-1234567890')).toThrow(BadRequestException);
    expect(() => pipe.transform('+1234567890')).toThrow(BadRequestException);
    expect(() => pipe.transform('1234567.890')).toThrow(BadRequestException);
  });

  it('bigint max값보다 큰 값이 들어오면 error ', () => {
    expect(() => pipe.transform('9223372036854775808')).toThrow(BadRequestException);
  });
});
