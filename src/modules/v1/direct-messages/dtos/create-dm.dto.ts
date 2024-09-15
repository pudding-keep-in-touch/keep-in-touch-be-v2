import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateDmDto {
  @ApiProperty({
    name: 'senderId',
    description: '보낸 사람 id',
    example: 1,
    required: true,
  })
  @IsNumber()
  senderId: number;

  // 받는 사람 이메일
  @ApiProperty({
    name: 'receiverEmail',
    description: '받는 사람 가입 이메일',
    example: 'user@example.com',
    required: true,
  })
  @IsString()
  @MaxLength(100)
  receiverEmail: string;

  @ApiProperty({
    name: 'emotionName',
    description: '감정 이름(응원과 감사, 솔직한 대화)',
    example: '응원과 감사',
    required: true,
  })
  @IsString()
  @MaxLength(50)
  emotionName: string;

  @ApiProperty({
    name: 'content',
    description: '쪽지 내용',
    example: '사실 너에게 말하고 싶은게 있어',
    required: true,
  })
  @IsString()
  @MaxLength(100)
  content: string;
}
