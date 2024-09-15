import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule as NestRouterModule } from '@nestjs/core';
import { AuthModule } from '@v1/auth/auth.module';
import { UsersModule } from '@v1/users/users.module';
import { DirectMessagesModule } from '@v1/direct-messages/direct-messages.module';

@Module({})
export class RouterModule {
  static register(): DynamicModule {
    return {
      module: RouterModule,
      imports: [
        UsersModule,
        DirectMessagesModule,
        AuthModule,
        NestRouterModule.register([
          {
            path: '/v1',
            module: DirectMessagesModule,
          },
          {
            path: '/v1',
            module: AuthModule,
          },
          {
            path: '/v1',
            module: UsersModule,
          },
        ]),
      ],
      exports: [NestRouterModule],
    };
  }
}
