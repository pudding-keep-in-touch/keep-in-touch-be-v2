import { BaseResponseDto } from '@common/common.dto';
import { response } from '@common/helpers/common.helper';
import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId/nickname')
  async getUserNickname(@Param('userId') userId: number): Promise<BaseResponseDto<string>> {
    const nickname = await this.usersService.getNicknameById(userId);
    return response(nickname, '유저 닉네임 조회 성공');
  }
}
