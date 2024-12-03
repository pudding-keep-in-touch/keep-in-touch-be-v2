import { Body, Controller, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GenerateSwaggerApiDoc, UserAuth } from '@common/common.decorator';
import { response } from '@common/helpers/common.helper';
import { User } from '@entities/user.entity';

import { BaseResponseDto } from '@common/common.dto';
import { CheckBigIntIdPipe } from '@common/pipes/check-bigint-id.pipe';
import { CreateQuestionDto, ResponseCreateQuestionDto } from './dto/create-question.dto';
import { ResponseUpdateQuestionHiddenDto, UpdateQuestionHiddenDto } from './dto/update-question-hidden';
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

  @Patch(':questionId')
  @GenerateSwaggerApiDoc({
    summary: '질문 숨김 / 해제',
    description: '질문을 숨기거나 숨김 해제 합니다.',
  })
  async updateQuestionHidden(
    @Body() { isHidden }: UpdateQuestionHiddenDto,
    @Param('questionId', CheckBigIntIdPipe) questionId: string,
    @UserAuth() user: User,
  ): Promise<BaseResponseDto<ResponseUpdateQuestionHiddenDto>> {
    const userId = user.userId;
    await this.questionsService.updateQuestionHidden({ questionId, isHidden, userId });
    return response({ questionId, isHidden }, '질문이 성공적으로 숨김 혹은 숨김해제 처리되었습니다.');
  }
}
