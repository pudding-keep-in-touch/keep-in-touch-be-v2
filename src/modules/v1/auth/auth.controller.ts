import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { response } from '@common/helpers/common.helper';
import { GenerateSwaggerApiDoc } from '@common/common.decorator';
import { Users } from '@entities/users.entity';
import { BaseResponseDto } from '@common/common.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  @GenerateSwaggerApiDoc({
    summary: '구글 로그인',
    description: 'Swagger에서 테스트 할 수 없습니다. localhost:3000/api/v1/auth/google/login 으로 테스트 해주세요.',
  })
  async googleLogin() {
    // Google 로그인 페이지로 리디렉션
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @GenerateSwaggerApiDoc({
    summary: '구글 로그인 콜백',
    description: 'Swagger에서 테스트 할 수 없습니다. localhost:3000/api/v1/auth/google/callback 으로 테스트 해주세요.',
  })
  async googleLoginCallback(@Req() req: any): Promise<BaseResponseDto<{ accessToken: string; user: Partial<Users> }>> {
    const { accessToken, user } = await this.authService.googleLogin(req.user);

    const userInfo = {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        loginType: user.loginType,
      },
    };
    return response(userInfo, '로그인 성공');
  }
}
