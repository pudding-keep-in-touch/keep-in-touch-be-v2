import { ApiProperty } from '@nestjs/swagger';
import { ReactionTypeString } from '../types/reactions.type';

// omit reactions of ReactionTemplate entity
export class ResponseReactionTemplates {
  @ApiProperty({
    description: '반응 템플릿 아이디',
    example: '1',
  })
  reactionTemplateId: string;

  @ApiProperty({
    description: 'emoji',
    example: '👍',
  })
  emoji: string;

  @ApiProperty({
    description: 'content',
    example: '고마워',
  })
  content: string;

  @ApiProperty({
    description: '반응 템플릿 타입 (감사 | 사과 | 응원 | 화해)',
    example: '감사',
  })
  type: ReactionTypeString;
}

export type ResponseGetReactionTemplatesDto = ResponseReactionTemplates[];
