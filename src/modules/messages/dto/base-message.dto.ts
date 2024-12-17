import { ApiProperty } from '@nestjs/swagger';

export class BaseMessageDto {
  @ApiProperty({
    description: '메시지 ID',
    example: '1',
  })
  messageId: string;

  @ApiProperty({
    description: '받는 사람 ID',
    example: '1',
  })
  receiverId: string;

  @ApiProperty({
    description: '받는 사람 닉네임',
    example: 'nickname',
  })
  receiverNickname: string;

  @ApiProperty({
    description: '메시지 내용',
    example: '눈이 많이와요',
  })
  content: string;

  @ApiProperty({
    description: '메세지 생성 시간',
    example: '2024-11-28T00:00:00.000Z',
  })
  createdAt: Date;
}
