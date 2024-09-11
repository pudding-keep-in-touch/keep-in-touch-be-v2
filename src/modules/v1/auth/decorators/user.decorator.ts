import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Auth 데코레이터
export const UserAuth = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
