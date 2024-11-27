import { RequestUser } from '@common/types/request-user.type';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class IsOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: RequestUser = context.switchToHttp().getRequest();
    if (request.user === undefined) {
      return false;
    }
    // 403 Forbidden
    if (request.user.userId !== request.params?.userId) {
      throw new ForbiddenException('본인이 생성한 질문만 조회할 수 있습니다.');
    }
    return true;
  }
}
