import { ApiProperty } from '@nestjs/swagger';
import { BaseQuestionDto } from './base-question.dto';

export class ResponseGetSharedQuestionDetailDto extends BaseQuestionDto {
  @ApiProperty({
    description: '질문 공유 및 작성한 유저 아이디',
    example: '1',
  })
  userId: string;

  @ApiProperty({
    description: '질문 숨김 여부',
    example: false,
  })
  isHidden: boolean;
}
