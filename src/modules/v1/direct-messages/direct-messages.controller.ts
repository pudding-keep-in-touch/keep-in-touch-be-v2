import { DirectMessagesService } from './direct-messages.service';
import { GenerateSwaggerApiDoc, NotUserAuth } from '@common/common.decorator';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { response } from '@common/helpers/common.helper';
import { CreateDmDto } from './dtos/create-dm.dto';

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
  async getDmDetail(@Param('directMessageId') directMessageId: number): Promise<any> {
    const result = await this.directMessagesService.getDmDetail(directMessageId);

    return response(result, '쪽지 상세 조회 성공');
  }

  @Post()
  @NotUserAuth()
  @GenerateSwaggerApiDoc({
    summary: '쪽지 전송',
    description: '받는 사람 가입 email로 쪽지 보내기',
  })
  async createDm(@Body() createDmDto: CreateDmDto) {
    const result = await this.directMessagesService.createDm(createDmDto);

    return response(result, '쪽지 전송 성공');
  }
}
