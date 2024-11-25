import { IsBigIntIdString } from '@common/decorators/is-bigint-id-string.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { MESSAGE_CONTENT_MAX, MESSAGE_CONTENT_MIN } from '../constants/messages.constant';

export class CreateMessageDto {
  @ApiProperty({
    description: '쪽지를 받을 유저의 id',
    example: '1',
    required: true,
  })
  @IsBigIntIdString()
  receiverId: string;

  @ApiProperty({
    description: '쪽지 내용',
    example: '너의 장점은 솔직하다는 거야.',
    required: true,
  })
  @IsString()
  @Length(MESSAGE_CONTENT_MIN, MESSAGE_CONTENT_MAX)
  content: string;

  @ApiProperty({
    description: '질문 id (질문 쪽지를 보낼 때만 필요, 감정 id와 중복 사용 불가)',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsBigIntIdString()
  questionId?: string;

  @ApiProperty({
    description: '감정 id (감정 쪽지를 보낼 때만 필요, 질문 id와 중복 사용 불가)',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsBigIntIdString()
  emotionId?: string;
}

export class ResponseCreateMessageDto {
  @ApiProperty({
    description: '생성된 쪽지의 id',
    example: '1',
  })
  messageId: string;
}
