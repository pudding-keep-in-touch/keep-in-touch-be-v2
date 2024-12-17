import { CustomTypeOrmModule } from '@common/custom-typeorm/custom-typeorm.module';
import { Module } from '@nestjs/common';
import { ReactionTemplateRepository } from '@repositories/reaction-template.repository';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([ReactionTemplateRepository])],
  providers: [ReactionsService],
  controllers: [ReactionsController],
})
export class ReactionsModule {}
