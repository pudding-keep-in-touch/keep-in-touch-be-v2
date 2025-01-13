import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class PostgresConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      database: this.configService.get<string>('database.name'),
      username: this.configService.get<string>('database.user'),
      password: this.configService.get<string>('database.password'),
      entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
      autoLoadEntities: true,
      synchronize: false,
      //logging: this.configService.get('APP_ENV') === 'local' || this.configService.get('APP_ENV') === 'test',
      logging: this.configService.get('APP_ENV') === 'local',
    };
  }
}
