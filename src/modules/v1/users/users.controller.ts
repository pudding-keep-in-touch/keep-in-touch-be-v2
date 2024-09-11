import { RequestGetDmListByUserIdDto } from '@v1/direct-messages/dtos/get-dm-list-by-user-id.dto';
import { GenerateSwaggerApiDoc, NotUserAuth } from '@common/common.decorator';
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '@v1/users/users.service';
import { response } from '@common/helpers/common.helper';
import { RequestSignUpDto } from './dtos/signup.dto';
import { Users } from '@entities/users.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserAuth } from '../auth/decorators/user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @NotUserAuth()
  @Post('signup')
  @GenerateSwaggerApiDoc({
    summary: '회원가입',
    description: '아이디와 비밀번호를 통하여 회원가입을 진행한다.',
  })
  async register(@Body() requestDto: RequestSignUpDto) {
    const user = await this.usersService.signup(requestDto);
    return response(user, '회원가입이 완료되었습니다.');
  }

  @Get(':userId/home')
  getUserHome() {
    return 'this is home';
  }

  @NotUserAuth()
  @Get(':userId/direct-messages')
  @GenerateSwaggerApiDoc({
    summary: '유저 id 기준 받은/보낸 쪽지 리스트 조회 하기',
    description: '유저 id 기준 받은/보낸 쪽지 리스트 조회 하기',
    // query: { type: RequestGetDmListByUserIdDto },
  })
  async getDmListByUserId(@Param('userId') userId: number, @Query() request: RequestGetDmListByUserIdDto): Promise<any> {
    const result = await this.usersService.getDmListByUserId(userId, request);
    return response(result, '쪽지 리스트 조회 성공');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @GenerateSwaggerApiDoc({
    summary: '사용자 프로필 조회',
    description: '유저 프로필 조회',
  })
  getProfile(@UserAuth() user: Users) {
    console.log('user', user);
    return user;
  }
}
