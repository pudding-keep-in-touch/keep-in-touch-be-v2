import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule as NestRouterModule } from '@nestjs/core';
import { MessagesModule } from '@modules/v1/messages/messages.module';

@Module({})
export class RouterModule {
  static register(): DynamicModule {
    return {
      module: RouterModule,
      imports: [
        MessagesModule,
        NestRouterModule.register([
          {
            path: '/v1',
            module: MessagesModule,
          },
        ]),
      ],
      exports: [NestRouterModule],
    };
  }
}
