import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateDmDto {
  @ApiProperty({
    description: '보낸 사람 id',
    example: 1,
    required: true,
  })
  @IsNumber()
  sender_id: number;

  // 받는 사람 이메일
  @ApiProperty({
    name: 'receiver_email',
    description: '받는 사람 가입 이메일',
    example: 'user@example.com',
    required: true,
  })
  @IsString()
  @MaxLength(100)
  receiver_email: string;

  @ApiProperty({
    name: 'emotion_name',
    description: '감정 이름(응원과 감사, 솔직한 대화)',
    example: 'thanks',
    required: true,
  })
  @IsString()
  @MaxLength(50)
  emotion_name: string;

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
