import { GenerateSwaggerApiDoc, UserAuth } from '@common/common.decorator';
import { BaseResponseDto } from '@common/common.dto';
import { IsOwnerGuard } from '@common/guards/is-owner.guard';
import { response } from '@common/helpers/common.helper';
import { CheckBigIntIdPipe } from '@common/pipes/check-bigint-id.pipe';
import { User } from '@entities/user.entity';
import { BaseQuestionDto } from '@modules/questions/dto/base-question.dto';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
    responseType: [BaseQuestionDto],
  })
  @UseGuards(IsOwnerGuard)
  async getMyQuestions(@Param('userId', CheckBigIntIdPipe) userId: string, @UserAuth() _loginUser: User) {
    const questions = await this.usersService.getMyQuestions(userId);
    return response(questions, '유저가 작성한 질문 조회 성공');
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
