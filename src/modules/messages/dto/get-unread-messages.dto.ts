import { ApiProperty } from '@nestjs/swagger';

export class ResponseGetUnreadMessagesDto {
  @ApiProperty({
    description: '읽지 않은 받은 메시지 개수',
    example: 1,
  })
  unreadMessageCount: number;

  @ApiProperty({
    description: '읽지 않은 반응이 있는 보낸 메세지 개수',
    example: 3,
  })
  unreadReactionCount: number;
}
