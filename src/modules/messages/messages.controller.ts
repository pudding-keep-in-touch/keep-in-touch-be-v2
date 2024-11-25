import { GenerateSwaggerApiDoc, UserAuth } from '@common/common.decorator';
import { response } from '@common/helpers/common.helper';
import { User } from '@entities/user.entity';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
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
      '쪽지를 성공적으로 전송했습니다.',
    );
  }
}
