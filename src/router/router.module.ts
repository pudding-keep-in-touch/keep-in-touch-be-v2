import { type DynamicModule, Module } from '@nestjs/common';
import { RouterModule as NestRouterModule } from '@nestjs/core';

import { AuthModule as AuthV1Module } from '@v1/auth/auth.module';
import { DirectMessagesModule as DirectV1MessagesModule } from '@v1/direct-messages/direct-messages.module';
import { UsersModule as UsersV1Module } from '@v1/users/users.module';
import { V1Module } from '@v1/v1.module';

import { AuthModule as AuthV2Module } from '@v2/auth/auth.module';
import { UsersModule as UsersV2Module } from '@v2/users/users.module';
import { V2Module } from '@v2/v2.module';

@Module({})
export class RouterModule {
  static register(): DynamicModule {
    const v1Routes = [AuthV1Module, UsersV1Module, DirectV1MessagesModule];
    const v2Routes = [AuthV2Module, UsersV2Module];

    return {
      module: RouterModule,
      imports: [
        V1Module,
        V2Module,
        NestRouterModule.register([
          { path: 'v1', children: v1Routes },
          { path: 'v2', children: v2Routes },
        ]),
      ],
      exports: [NestRouterModule],
    };
  }
}
