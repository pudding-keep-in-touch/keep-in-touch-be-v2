import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateDmDto {
  @ApiProperty({
    name: 'receiverId',
    description: '받는 사람 아이디',
    example: 1,
    required: true,
  })
  @IsNumber()
  receiverId: number;

  @ApiProperty({
    name: 'emotionId',
    description: '감정 아이디',
    example: 1,
    required: true,
  })
  @IsNumber()
  emotionId: number;

  @ApiProperty({
    name: 'content',
    description: '쪽지 내용',
    example: '사실 너에게 말하고 싶은게 있어',
    required: true,
  })
  @IsString()
  @MaxLength(200)
  content: string;
}
