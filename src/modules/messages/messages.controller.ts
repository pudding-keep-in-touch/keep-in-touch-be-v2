import { GenerateSwaggerApiDoc, UserAuth } from '@common/common.decorator';
import { response } from '@common/helpers/common.helper';
import { CheckBigIntIdPipe } from '@common/pipes/check-bigint-id.pipe';
import { User } from '@entities/user.entity';
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDto, ResponseCreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @GenerateSwaggerApiDoc({
    summary: '쪽지 전송',
    description: '쪽지를 전송합니다.',
    responseType: ResponseCreateMessageDto,
    responseStatus: HttpStatus.CREATED,
  })
  @Post()
  async createMessage(@Body() createMessageDto: CreateMessageDto, @UserAuth() user: User) {
    return response(
      await this.messagesService.createMessage(createMessageDto, user.userId),
      '쪽지가 성공적으로 전송되었습니다.',
      HttpStatus.CREATED,
    );
  }

  @GenerateSwaggerApiDoc({
    summary: '쪽지 상세 조회',
    description: '쪽지 상세를 조회합니다.',
  })
  @Get(':messageId')
  async getMessageDetail(@Param('messageId', CheckBigIntIdPipe) messageId: string, @UserAuth() user: User) {
    const { userId } = user;
    const result = await this.messagesService.getMessageDetail({ messageId, userId });
    return response(result, '쪽지 상세정보가 조회되었습니다.');
  }
}
