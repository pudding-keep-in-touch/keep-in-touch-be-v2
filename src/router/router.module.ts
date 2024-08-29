import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule as NestRouterModule } from '@nestjs/core';
import { MessagesModule } from '@modules/v1/messages/messages.module';
import { AuthModule } from '@modules/v1/auth/auth.module';
import { UsersModule } from '@modules/v1/users/users.module';

@Module({})
export class RouterModule {
  static register(): DynamicModule {
    return {
      module: RouterModule,
      imports: [
        MessagesModule,
        AuthModule,
        NestRouterModule.register([
          {
            path: '/v1',
            module: MessagesModule,
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
