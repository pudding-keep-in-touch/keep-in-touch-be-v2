import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from '@repositories/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
