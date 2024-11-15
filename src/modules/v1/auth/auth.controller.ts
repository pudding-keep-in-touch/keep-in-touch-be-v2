import { GenerateSwaggerApiDoc } from '@common/common.decorator';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ResponseGoogleCallbackDto } from './dtos/google-callback.dto';

@Controller('auth')
@ApiTags('auth')
@UseGuards(AuthGuard('google'))
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/login')
  @GenerateSwaggerApiDoc({
    summary: '구글 로그인',
    description: 'Swagger에서 테스트 할 수 없습니다. http://localhost:3000/v1/auth/google/login 으로 테스트 해주세요.',
  })
  async googleLogin() {
    // Google 로그인 페이지로 리디렉션
  }

  @Get('google/callback')
  @GenerateSwaggerApiDoc({
    summary: '구글 로그인 콜백',
    description:
      'Swagger에서 테스트 할 수 없습니다. http://localhost:3000/v1/auth/google/callback 으로 테스트 해주세요.',
    responseType: ResponseGoogleCallbackDto,
  })
  async googleLoginCallback(@Req() req: any, @Res() res: Response): Promise<void> {
    const { accessToken, user } = await this.authService.googleLogin(req.user);

    // NOTE: config module 사용하게 변경
    const redirectUrl = `${process.env.REDIRECT_URL}/auth/callback?accessToken=${accessToken}&userId=${user.id}`;
    res.redirect(redirectUrl);
  }
}
