import { NOT_AUTH } from '@common/common.decorator';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const notAuth = this.reflector.get<boolean>(NOT_AUTH, context.getHandler());

    // NotAuth 데코레이터 붙은 endPoint는 auth 가드 검증에서 제외 처리
    if (notAuth) {
      return true;
    }

    return super.canActivate(context);
  }
}
