import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    console.log('GET google/login - googleAuth 실행');
    console.log('googleAuth endpoint called');
    // Google OAuth 로그인 페이지로 리다이렉트됩니다.
  }
  // async googleAuth(@Req() _req: Request) {
  //   // Google OAuth 로그인 페이지로 리다이렉트됩니다.
  // }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    console.log('googleAuthRedirect endpoint called');
    console.log('User information from Google:', req.user);

    res.json({
      message: 'User information from Google',
      user: req.user,
    });
  }
  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // googleAuthRedirect(@Req() req: Request) {
  //   // Google OAuth 로그인 후 리다이렉트 되는 콜백 URL
  //   return {
  //     message: 'User information from Google',
  //     user: req.user,
  //   };
  // }
}


// import { Controller, Get, HttpCode, Req, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// // import { AuthService } from './auth.service';

// @Controller('auth')
// export class AuthController {
//   // constructor(private authService: AuthService) {}

//   @Get('kakao') // 카카오 서버를 거쳐서 도착하게 될 엔드포인트
//   @UseGuards(AuthGuard('kakao')) // kakao.strategy를 실행시켜 줍니다.
//   @HttpCode(301)
//   async kakaoLogin(@Req() req: Request) {
//     console.log(req);
//     // 카카오 로그인 리다이렉트
//   }
// }
