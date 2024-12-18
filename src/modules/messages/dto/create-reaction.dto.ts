import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';

export class CreateReactionDto {
  @ApiProperty({
    description: '생성할 반응의 템플릿 아이디 리스트, 최대 5개.',
    example: ['1', '2'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: '최소 1개 이상의 template ID가 필요합니다' })
  @ArrayMaxSize(5, { message: '최대 5개까지의 template ID만 허용됩니다' })
  // TODO: 중복검사, 숫자형태 검사.
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
