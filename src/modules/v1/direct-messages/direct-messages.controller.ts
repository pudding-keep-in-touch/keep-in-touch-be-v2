import { DirectMessagesService } from './direct-messages.service';
import { GenerateSwaggerApiDoc, UserAuth } from '@common/common.decorator';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { response } from '@common/helpers/common.helper';
import { CreateDmDto } from './dtos/create-dm.dto';
import { JwtAuthGuard } from '@v1/auth/guards/jwt-auth.guard';
import { Users } from '@entities/users.entity';

@ApiTags('direct-messages')
@UseGuards(JwtAuthGuard)
@Controller('direct-messages')
export class DirectMessagesController {
  constructor(private readonly directMessagesService: DirectMessagesService) {}

  @Get(':directMessageId')
  @GenerateSwaggerApiDoc({
    summary: '메시지 상세 조회',
    description: '메시지 id 기준 받은/보낸 쪽지 상세 조회',
  })
  async getDmDetail(@UserAuth() user: Users, @Param('directMessageId') directMessageId: number): Promise<any> {
    const result = await this.directMessagesService.getDmDetail(directMessageId, user.id);

    return response(result, '쪽지 상세 조회 성공');
  }

  @Post()
  @GenerateSwaggerApiDoc({
    summary: '쪽지 전송',
    description: '받는 사람 id로 쪽지 보내기',
  })
  async createDm(@UserAuth() user: Users, @Body() createDmDto: CreateDmDto) {
    const result = await this.directMessagesService.createDm(user.id, createDmDto);

    return response(result, '쪽지 전송 성공');
  }
}
