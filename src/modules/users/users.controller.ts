import { GenerateSwaggerApiDoc } from '@common/common.decorator';
import { BaseResponseDto } from '@common/common.dto';
import { response } from '@common/helpers/common.helper';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseGetUserNicknameDto } from './dto/get-user-nickname.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId/nickname')
  @GenerateSwaggerApiDoc({
    summary: '유저 닉네임 조회',
    description: '유저 id 기준 닉네임 조회',
    responseType: ResponseGetUserNicknameDto,
  })
  async getUserNickname(@Param('userId') userId: string): Promise<BaseResponseDto<ResponseGetUserNicknameDto>> {
    const nickname = await this.usersService.getNicknameById(userId);
    return response(nickname, '유저 닉네임 조회 성공');
  }
}
