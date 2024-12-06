import { ApiProperty } from '@nestjs/swagger';
import { BaseQuestionDto } from './base-question.dto';

export class SharedQuestionDto extends BaseQuestionDto {
  @ApiProperty({
    description: '질문 공유 및 작성한 유저 아이디',
    example: '1',
  })
  userId: string;
}

export type ResponseGetSharedQuestionsDto = SharedQuestionDto[];
