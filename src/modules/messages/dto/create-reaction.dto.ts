import { ApiProperty } from '@nestjs/swagger';
import { IsValidTemplateIds } from '../decorators/is-valid-template-id.decorator';

export class CreateReactionDto {
  @ApiProperty({
    description: '생성할 반응의 템플릿 아이디 리스트, 최대 5개.',
    example: ['1', '2'],
  })
  @IsValidTemplateIds()
  templateIds: string[];
}

export class ResponseCreateReactionDto {
  @ApiProperty({
    description: '반응 생성한 쪽지의 id',
    example: '1',
  })
  messageId: string;

  @ApiProperty({
    description: '생성된 반응의 ID 리스트',
    example: ['1', '2'],
  })
  reactionIds: string[];
}
