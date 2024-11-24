import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GenerateSwaggerApiDoc, UserAuth } from '@common/common.decorator';
import { response } from '@common/helpers/common.helper';
import { User } from '@entities/user.entity';

import { BaseResponseDto } from '@common/common.dto';
import { CreateQuestionDto, ResponseCreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @GenerateSwaggerApiDoc({
    summary: '질문 등록',
    description: '질문을 등록합니다.',
    responseType: ResponseCreateQuestionDto,
    responseStatus: HttpStatus.CREATED,
  })
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @UserAuth() user: User,
  ): Promise<BaseResponseDto<ResponseCreateQuestionDto>> {
    const result = await this.questionsService.createQuestion(createQuestionDto, user.userId);
    return response(result, '질문이 성공적으로 등록되었습니다.', HttpStatus.CREATED);
  }
}
