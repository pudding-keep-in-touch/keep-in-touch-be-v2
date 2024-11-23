import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, Length } from 'class-validator';
import { QUESTION_CONTENT_MAX, QUESTION_CONTENT_MIN } from '../constants/question.constant';

export class CreateQuestionDto {
  @ApiProperty({
    description: '질문 내용',
    example: '내 장점에 대해서 알려줘',
    required: true,
  })
  @IsString()
  @Length(QUESTION_CONTENT_MIN, QUESTION_CONTENT_MAX, {
    message: '질문 내용은 2자 이상 140자 이하여야 합니다.',
  })
  content: string;

  @ApiProperty({
    description: '질문 숨김 여부',
    example: false,
    required: true,
    default: false,
  })
  @IsBoolean()
  isHidden: boolean;
}

export class ResponseCreateQuestionDto {
  @ApiProperty({
    description: '생성된 질문 ID',
    example: 1,
  })
  questionId: number;
}
