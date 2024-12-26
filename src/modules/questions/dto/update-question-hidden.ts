import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateQuestionHiddenDto {
  @ApiProperty({
    description: '질문 숨김 여부',
    example: true,
    required: true,
  })
  @IsBoolean()
  isHidden: boolean;
}

export class ResponseUpdateQuestionHiddenDto {
  @ApiProperty({
    description: '숨김 및 해제 처리 완료한 질문 ID',
    example: '1',
  })
  questionId: string;

  @ApiProperty({
    description: '업데이트된 질문 숨김 여부',
    example: true,
  })
  isHidden: boolean;
}
