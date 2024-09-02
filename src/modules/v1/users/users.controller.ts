import { RequestGetDmListByUserIdDto } from '@v1/direct-messages/dtos/get-dm-list-by-user-id.dto';
import { GenerateSwaggerApiDoc, NotUserAuth } from '@common/common.decorator';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '@v1/users/users.service';
import { response } from '@common/helpers/common.helper';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    console.log(request);
    const result = await this.usersService.getDmListByUserId(userId, request);
    return response(result, '쪽지 리스트 조회 성공');
  }
}
