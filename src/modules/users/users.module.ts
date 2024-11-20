import { Module } from '@nestjs/common';

import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { UsersRepository } from '@modules/users/users.repository';

import { LoggerModule } from '@logger/logger.module';
import { UsersService } from './users.service';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([UsersRepository]), LoggerModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
