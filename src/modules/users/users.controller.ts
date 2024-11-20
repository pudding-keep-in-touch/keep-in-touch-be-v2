import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId/nickname')
  async getUserNickname(@Param('userId') userId: number): Promise<string> {
    return this.usersService.getNicknameByUserId(userId);
  }
}
