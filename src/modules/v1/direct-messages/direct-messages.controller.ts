import { DirectMessagesService } from './direct-messages.service';
import { GenerateSwaggerApiDoc, NotUserAuth } from '@common/common.decorator';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestGetDmDetailDto } from './dtos/get-dm-detail.dto';
import { response } from '@common/helpers/common.helper';

@ApiTags('direct-messages')
@Controller('direct-messages')
export class DirectMessagesController {
  constructor(private readonly directMessagesService: DirectMessagesService) {}

  @NotUserAuth()
  @Get(':directMessageId')
  @GenerateSwaggerApiDoc({
    summary: '메시지 상세 조회',
    description: '메시지 id 기준 받은/보낸 쪽지 상세 조회',
  })
  async getDmDetail(@Param('directMessageId') directMessageId: number, @Query() request: RequestGetDmDetailDto): Promise<any> {
    const result = await this.directMessagesService.getDmDetail(directMessageId, request);
    return response(result, '쪽지 상세 조회 성공');
  }
}
