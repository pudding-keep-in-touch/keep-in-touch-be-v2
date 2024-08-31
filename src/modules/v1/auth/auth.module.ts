import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '@entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule.forRoot({
    isGlobal: true, // 전역으로 설정
    // validate: validateEnv(),
  }),
    AuthModule,],
  providers: [AuthService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule { }



// import { Module } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';

// @Module({
//   providers: [AuthService], //비즈니스 로직이 구현된 서비스 파일. 사용자 인증, JWT 토큰 발급, DB에 정보 저장, 인증
//   controllers: [AuthController], //http 요청을 처리하는 컨트롤러. 인증 관련 요청(로그인, 회원가입 등)을 처리, 주로 AuthService를 사용해 비즈니스 로직을 수행
// })
// export class AuthModule { }
// //authservice, authcontroller 하나로 묶어줌
