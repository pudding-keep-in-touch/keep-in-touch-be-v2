import { RequestGetDmListByUserIdDto, ResponseGetDmListByUserIdDto } from '@v1/direct-messages/dtos/get-dm-list-by-user-id.dto';
import { GenerateSwaggerApiDoc } from '@common/common.decorator';
import { Controller, Get, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '@v1/users/users.service';
import { response } from '@common/helpers/common.helper';
import { BaseResponseDto } from '@common/common.dto';
import { UserAuth } from '@common/common.decorator';
import { Users } from '@entities/users.entity';
import { ResponseGetUserHomeDto } from './dtos/get-user-home.dto';
import { JwtAuthGuard } from '@v1/auth/guards/jwt-auth.guard';

@Controller('users')
@ApiTags('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId/home')
  @GenerateSwaggerApiDoc({
    summary: '유저 홈 화면 조회',
    description: '유저 홈 화면 조회',
    responseType: ResponseGetUserHomeDto,
  })
  async getUserHome(@UserAuth() users: Users, @Param('userId') userId: number): Promise<BaseResponseDto<ResponseGetUserHomeDto>> {
    const isOwner = userId == users.id;
    const result = await this.usersService.getUserHome(users, userId, isOwner);

    return response(result, '유저 홈 화면 조회 성공');
  }

  @Get(':userId/direct-messages')
  @GenerateSwaggerApiDoc({
    summary: '유저 id 기준 받은/보낸 쪽지 리스트 조회 하기',
    description: '유저 id 기준 받은/보낸 쪽지 리스트 조회 하기',
    responseType: ResponseGetDmListByUserIdDto,
  })
  async getDmListByUserId(
    @UserAuth() users: Users,
    @Param('userId') userId: number,
    @Query() request: RequestGetDmListByUserIdDto,
  ): Promise<BaseResponseDto<ResponseGetDmListByUserIdDto[]>> {
    const result = await this.usersService.getDmListByUserId(users, userId, request);

    return response(result, '쪽지 리스트 조회 성공');
  }

  @Delete(':userId/withdraw')
  @GenerateSwaggerApiDoc({
    summary: '회원 탈퇴',
    description: '현재 로그인한 사용자의 계정을 탈퇴 처리합니다.',
  })
  async withdrawUser(@Param('userId') userId: number): Promise<BaseResponseDto<void>> {
    await this.usersService.withdrawUser(userId);
    return response(null, '회원 탈퇴가 완료되었습니다.');
  }
}
