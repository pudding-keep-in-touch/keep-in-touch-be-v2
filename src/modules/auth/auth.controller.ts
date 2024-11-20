import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { GenerateSwaggerApiDoc } from '@common/common.decorator';

import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('auth')
@UseGuards(AuthGuard('google'))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google/login')
  @GenerateSwaggerApiDoc({
    summary: '구글 로그인',
    description: 'Swagger에서 테스트 할 수 없습니다. http://localhost:3000/v2/auth/google/login 으로 테스트 해주세요.',
  })
  async googleLogin() {
    // Google 로그인 페이지로 리디렉션t
  }

  @Get('google/callback')
  @GenerateSwaggerApiDoc({
    summary: '구글 로그인 콜백',
    description:
      'Swagger에서 테스트 할 수 없습니다. http://localhost:3000/v2/auth/google/callback 으로 테스트 해주세요.',
  })
  async googleLoginCallback(@Req() req: any, @Res() res: Response): Promise<void> {
    const { accessToken, userId } = await this.authService.googleLogin(req.user);

    const redirectUrl = `${this.configService.get<string>('REDIRECT_URL')}/auth/callback?accessToken=${accessToken}&userId=${userId}`;
    res.redirect(redirectUrl);
  }
}
