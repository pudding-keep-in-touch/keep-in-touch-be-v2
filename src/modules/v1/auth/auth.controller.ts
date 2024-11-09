import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GenerateSwaggerApiDoc } from '@common/common.decorator';
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

    /**
     * @memo
     * 구글 로그인 콜백 처리
     * URL 하드코딩 되어 있으므로 개발/운영 환경 변수로 설정 필요
     */
    const redirectUrl = `${process.env.REDIRECT_URL}/auth/callback?accessToken=${accessToken}&userId=${user.id}`;
    res.redirect(redirectUrl);
  }
}
