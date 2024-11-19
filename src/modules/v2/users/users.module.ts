import { Module } from '@nestjs/common';

import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { UserRepository } from '@v2/users/user.repository';

import { LoggerModule } from '@logger/logger.module';
import { UsersService } from './users.service';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([UserRepository]), LoggerModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
