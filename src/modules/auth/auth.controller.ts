import { Controller, Get, Req, Res } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { GenerateSwaggerApiDoc, NotUserAuth } from '@common/common.decorator';

import { AppConfigService } from '@configs/app/app-config.service';
import { AuthService } from './auth.service';

import { UseOIDC } from './decorators/use-oidc.decorator';
import { GoogleOIDCProvider } from './providers/google-oidc.provider';
import { KakaoOIDCProvider } from './providers/kakao-oidc.provider';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @GenerateSwaggerApiDoc({
    summary: '구글 로그인',
    description: 'Swagger에서 테스트 할 수 없습니다. ${APP_URL}/v2/auth/google/login 으로 테스트 해주세요.',
  })
  @NotUserAuth()
  @Get('google/login')
  @UseOIDC(GoogleOIDCProvider)
  async googleLogin() {}

  @GenerateSwaggerApiDoc({
    summary: '구글 로그인 콜백',
    description: 'Swagger에서 테스트 할 수 없습니다. ${APP_URL}/v2/auth/google/callback 으로 테스트 해주세요.',
  })
  @NotUserAuth()
  @Get('google/callback')
  @UseOIDC(GoogleOIDCProvider)
  async googleLoginCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const query = req.query;

    if (query.code === undefined) {
      throw new Error('code is not provided');
    }
    const { accessToken, userId } = await this.authService.googleLogin(req.user);
    const redirectUrl = `${this.appConfigService.clientUrl}/auth/callback?userId=${userId}&accessToken=${accessToken}`;

    res.redirect(redirectUrl);
  }

  @GenerateSwaggerApiDoc({
    summary: '카카오 로그인',
    description: 'Swagger에서 테스트 할 수 없습니다. ${APP_URL}/v2/auth/kakao/login 으로 테스트 해주세요.',
  })
  @NotUserAuth()
  @Get('kakao/login')
  @UseOIDC(KakaoOIDCProvider)
  async kakaoLogin() {}

  @GenerateSwaggerApiDoc({
    summary: '카카오 로그인',
    description: 'Swagger에서 테스트 할 수 없습니다. ${APP_URL}/v2/auth/kakao/callback 으로 테스트 해주세요.',
  })
  @NotUserAuth()
  @Get('kakao/callback')
  @UseOIDC(KakaoOIDCProvider)
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    const query = req.query;
    if (query.code === undefined) {
      throw new Error('code is not provided');
    }
    const { accessToken, userId } = await this.authService.kakaoLogin(req.user);
    const redirectUrl = `${this.appConfigService.clientUrl}/auth/callback?userId=${userId}&accessToken=${accessToken}`;

    res.redirect(redirectUrl);
  }
}
