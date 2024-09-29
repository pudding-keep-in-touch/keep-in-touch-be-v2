import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class RequestGetDmDetailDto {
  @ApiProperty({
    name: 'type',
    example: 'received',
    description: '조회 타입(received: 쪽지 받은, sent: 쪽지 보낸)',
    required: false,
  })
  @IsEnum(['received', 'sent'])
  @IsOptional()
  type?: 'received' | 'sent' = 'received';
}
