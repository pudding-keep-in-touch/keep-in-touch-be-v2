import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class RequestGetDmListByUserIdDto {
  @ApiProperty({
    name: 'type',
    example: 'received',
    description: '조회 타입(received: 쪽지 받은, sent: 쪽지 보낸)',
    required: false,
  })
  @IsEnum(['received', 'sent'])
  @IsOptional()
  type: 'received' | 'sent' = 'received';

  @ApiProperty({
    name: 'page',
    example: 1,
    description: '조회 할 페이지',
    required: true,
  })
  @IsNumber()
  // @Min(1)
  // @IsOptional()
  @Type(() => Number)
  page = 1;

  @ApiProperty({
    name: 'limit',
    example: 10,
    description: '조회 갯수',
    required: true,
  })
  @IsNumber()
  // @Min(1)
  // @IsOptional()
  @Type(() => Number)
  limit = 10;
}

export class ResponseGetDmListByUserIdDto {}
