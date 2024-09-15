import { RequestGetDmListByUserIdDto, ResponseGetDmListByUserIdDto } from '@v1/direct-messages/dtos/get-dm-list-by-user-id.dto';
import { GenerateSwaggerApiDoc } from '@common/common.decorator';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '@v1/users/users.service';
import { response } from '@common/helpers/common.helper';
import { BaseResponseDto } from '@common/common.dto';
import { UserAuth } from '@common/common.decorator';
import { Users } from '@entities/users.entity';
import { ResponseGetUserHomeDto } from './dtos/get-user-home.dto';
import { JwtAuthGuard } from '@v1/auth/guards/jwt-auth.guard';


@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId/home')
  @GenerateSwaggerApiDoc({
    summary: '유저 홈 화면 조회',
    description: '유저 홈 화면 조회',
    responseType: ResponseGetUserHomeDto,
  })
  async getUserHome(@UserAuth() users: Users, @Param('userId') userId: number,) {
    console.log(users, userId);
    const isOwner = userId == users.id;
    const result = await this.usersService.getUserHome(userId, isOwner);
    return response(result, '유저 홈 화면 조회 성공');
  }

  @Get(':userId/direct-messages')
  @GenerateSwaggerApiDoc({
    summary: '유저 id 기준 받은/보낸 쪽지 리스트 조회 하기',
    description: '유저 id 기준 받은/보낸 쪽지 리스트 조회 하기',
    responseType: ResponseGetDmListByUserIdDto,
  })
  async getDmListByUserId(@Param('userId') userId: number, @Query() request: RequestGetDmListByUserIdDto): Promise<BaseResponseDto<ResponseGetDmListByUserIdDto[]>> {
    const result = await this.usersService.getDmListByUserId(userId, request);
    return response(result, '쪽지 리스트 조회 성공');
  }
}
