import { GenerateSwaggerApiDoc, UserAuth } from '@common/common.decorator';
import { response } from '@common/helpers/common.helper';
import { CheckBigIntIdPipe } from '@common/pipes/check-bigint-id.pipe';
import { User } from '@entities/user.entity';
import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { /*ApiBody, ApiExtraModels, , getSchemaPath*/ ApiTags } from '@nestjs/swagger';
import {
  //CreateEmotionMessageDto,
  CreateMessageDto,
  //CreateQuestionMessageDto,
  ResponseCreateMessageDto,
} from './dto/create-message.dto';
import { ReceivedMessageDetailDto } from './dto/message-detail.dto';
import { ResponseUpdateMessageStatusDto, UpdateMessageStatusDto } from './dto/update-message-status.dto';
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
  //@ApiExtraModels(CreateEmotionMessageDto, CreateQuestionMessageDto)
  //@ApiBody({
  //  schema: {
  //    title: 'CreateMessageDto',
  //    oneOf: [{ $ref: getSchemaPath(CreateEmotionMessageDto) }, { $ref: getSchemaPath(CreateQuestionMessageDto) }],
  //    discriminator: {
  //      propertyName: 'emotionId', // emotionId의 존재여부로 구분
  //      mapping: {
  //        emotion: getSchemaPath(CreateEmotionMessageDto),
  //        question: getSchemaPath(CreateQuestionMessageDto),
  //      },
  //    },
  //  },
  //})
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
    responseType: [ReceivedMessageDetailDto],
  })
  @Get(':messageId')
  async getMessageDetail(@Param('messageId', CheckBigIntIdPipe) messageId: string, @UserAuth() user: User) {
    const { userId } = user;
    const result = await this.messagesService.getMessageDetail({ messageId, userId });
    return response(result, '쪽지 상세정보가 조회되었습니다.');
  }

  @GenerateSwaggerApiDoc({
    summary: '쪽지 상태 변경',
    description: '쪽지의 상태를 변경합니다.',
    responseType: ResponseUpdateMessageStatusDto,
  })
  @Patch(':messageId')
  async updateMessageStatus(
    @Param('messageId', CheckBigIntIdPipe) messageId: string,
    @Body() { status }: UpdateMessageStatusDto,
    @UserAuth() user: User,
  ) {
    const result = await this.messagesService.updateMessageStatus({ messageId, userId: user.userId, status });
    return response(result, `쪽지 상태가 ${status}로 변경되었습니다`);
  }
}
