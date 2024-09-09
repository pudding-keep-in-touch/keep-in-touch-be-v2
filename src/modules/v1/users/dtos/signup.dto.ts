import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RequestSignUpDto {
  @ApiProperty({
    name: 'email',
    example: 'vanillaleedana@gmail.com',
    description: '이메일 주소',
    required: true,
  })
  @IsString()
  email: string;

  @ApiProperty({
    name: 'password',
    example: '1234@#L~',
    description: '비밀번호',
    required: true,
  })
  @IsString()
  password: string;
}
