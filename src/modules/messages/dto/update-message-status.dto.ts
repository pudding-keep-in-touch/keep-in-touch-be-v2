import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MESSAGE_STATUS } from '../constants/messages.constant';
import { MessageStatusString } from '../types/messages.type';

export class UpdateMessageStatusDto {
  @ApiProperty({
    description: '쪽지 상태',
    example: 'hidden',
    enum: MESSAGE_STATUS,
    required: true,
  })
  @IsEnum(MESSAGE_STATUS, { message: 'status은 hidden, normal, reported 중 하나여야 합니다.' })
  status: MessageStatusString;
}

export class ResponseUpdateMessageStatusDto {
  @ApiProperty({ description: '쪽지 id', example: '1' })
  messageId: string;

  @ApiProperty({ description: '반영된 상태값', example: 'hidden' })
  status: MessageStatusString;
}
