import { ApiProperty } from '@nestjs/swagger';

// omit reactions of ReactionTemplate entity
export class GetReactionTemplatesDto {
  @ApiProperty({
    description: 'reaction template id',
    example: 1,
  })
  reactionTemplateId: string;

  @ApiProperty({
    description: 'emoji',
    example: '👍',
  })
  emoji: string;

  @ApiProperty({
    description: 'content',
    example: '감사',
  })
  content: string;

  @ApiProperty({
    description: '반응 템플릿 타입 (감사 | 사과 | 응원 | 화해)',
    example: '감사',
  })
  type: string;
}

export type ResponseGetReactionTemplatesDto = GetReactionTemplatesDto[];
