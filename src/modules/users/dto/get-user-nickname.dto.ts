import { ApiProperty } from '@nestjs/swagger';

export class ResponseGetUserNicknameDto {
  @ApiProperty({
    name: 'userId',
    example: '1',
    description: '유저 id',
  })
  userId: string;

  @ApiProperty({
    name: 'nickname',
    example: 'nickname',
    description: '유저 닉네임',
  })
  nickname: string;
}
