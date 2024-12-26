import { GenerateSwaggerApiDoc } from '@common/common.decorator';
import { BaseResponseDto } from '@common/common.dto';
import { IsOwnerGuard } from '@common/guards/is-owner.guard';
import { response } from '@common/helpers/common.helper';
import { CheckBigIntIdPipe } from '@common/pipes/check-bigint-id.pipe';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetMyMessagesQuery, GetMySentMessagesDto } from './dto/get-my-messages.dto';
import { MyQuestionDto } from './dto/get-my-questions.dto';
import { ResponseGetUserNicknameDto } from './dto/get-user-nickname.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId/questions')
  @GenerateSwaggerApiDoc({
    summary: '유저가 작성한 질문 조회',
    description: '유저 id 기준 작성한 질문 조회, 로그인한 유저 id와 일치하지 않으면 조회 불가.',
    responseType: [MyQuestionDto],
  })
  @UseGuards(IsOwnerGuard)
  async getMyQuestions(@Param('userId', CheckBigIntIdPipe) userId: string) {
    const questions = await this.usersService.getMyQuestions(userId);
    return response(questions, '유저가 작성한 질문 조회 성공');
  }

  @Get(':userId/messages')
  @GenerateSwaggerApiDoc({
    summary: '유저가 보낸/받은 쪽지 조회',
    description:
      '유저 id 기준 보내거나 받은 쪽지 조회, 로그인한 유저 id와 일치하지 않으면 조회 불가. type query parameter로 보낸 쪽지(sent)와 받은 쪽지(received) 구분하여 조회 가능.',
    responseType: GetMySentMessagesDto,
  })
  @UseGuards(IsOwnerGuard)
  async getMyMessages(@Param('userId', CheckBigIntIdPipe) userId: string, @Query() query: GetMyMessagesQuery) {
    const messages = await this.usersService.getMyMessages(userId, query);
    return response(messages, '유저 쪽지 조회 성공');
  }

  @Get(':userId/nickname')
  @GenerateSwaggerApiDoc({
    summary: '유저 닉네임 조회',
    description: '유저 id 기준 닉네임 조회',
    responseType: ResponseGetUserNicknameDto,
  })
  async getUserNickname(
    @Param('userId', CheckBigIntIdPipe) userId: string,
  ): Promise<BaseResponseDto<ResponseGetUserNicknameDto>> {
    const nickname = await this.usersService.getNicknameById(userId);
    return response(nickname, '유저 닉네임 조회 성공');
  }
}
