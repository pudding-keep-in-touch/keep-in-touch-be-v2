import { ApiProperty } from '@nestjs/swagger';

/**
 * 공통 question 속성 정의
 * questionId, content, isHidden, createdAt
 */
export class BaseQuestionDto {
  @ApiProperty({
    description: '질문 id',
    example: '1',
  })
  questionId: string;

  @ApiProperty({
    description: '질문 내용',
    example: '질문 내용',
  })
  content: string;

  @ApiProperty({
    description: '숨김 여부',
    example: false,
  })
  isHidden: boolean;

  @ApiProperty({
    description: '생성일',
    example: '2024-11-26T00:00:00',
  })
  createdAt: Date;
}
