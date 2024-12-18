import { RequestUser } from '@common/types/request-user.type';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class IsOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: RequestUser = context.switchToHttp().getRequest();
    if (!request.user?.userId) {
      return false;
    }
    // 403 Forbidden
    if (request.user.userId !== request.params?.userId) {
      // if request contains question: 질문, message: 쪽지
      const req = context.switchToHttp().getRequest();
      if (req.path.includes('questions')) {
        throw new ForbiddenException('본인이 생성한 질문만 조회할 수 있습니다.');
      }
      if (req.path.includes('messages')) {
        throw new ForbiddenException('본인이 보내거나 받은 쪽지만 조회할 수 있습니다.');
      }
      throw new ForbiddenException('본인의 리소스만 조회할 수 있습니다.');
    }
    return true;
  }
}
