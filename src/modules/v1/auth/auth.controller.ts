import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
// import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  // constructor(private authService: AuthService) {}

  @Get('kakao') // 카카오 서버를 거쳐서 도착하게 될 엔드포인트
  @UseGuards(AuthGuard('kakao')) // kakao.strategy를 실행시켜 줍니다.
  @HttpCode(301)
  async kakaoLogin(@Req() req: Request) {
    console.log(req);
    // 카카오 로그인 리다이렉트
  }
}
