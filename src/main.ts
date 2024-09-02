import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // swagger 설정
  const config = new DocumentBuilder()
    .setTitle(`${configService.get('APP_NAME')}_${configService.get('APP_ENV')}`)
    .setDescription('API description')
    // .setVersion('1.0')
    // .addTag('your-tag')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
