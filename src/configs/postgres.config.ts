import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export async function postgreSqlConfig(configService: ConfigService): Promise<TypeOrmModuleOptions> {
  return {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USERNAME'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DATABASE'),
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: false,
    autoLoadEntities: true,
    logging: configService.get('APP_ENV') === 'local',
  };
}
