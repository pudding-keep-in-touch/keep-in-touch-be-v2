import { BaseQuestionDto } from '@modules/questions/dto/base-question.dto';
import { ApiProperty } from '@nestjs/swagger';

export class MyQuestionDto extends BaseQuestionDto {
  @ApiProperty({
    description: '숨김 여부',
    example: false,
  })
  isHidden: boolean;
}

export type ResponseGetMyQuestionsDto = MyQuestionDto[];
