import { GenerateSwaggerApiDoc } from '@common/common.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseReactionTemplates } from './dto/get-reaction-templates.dto';
import { ReactionsService } from './reactions.service';

@ApiTags('reactions')
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @GenerateSwaggerApiDoc({
    summary: '반응 템플릿 조회',
    description: '반응 템플릿 조회',
    responseType: [ResponseReactionTemplates],
  })
  @Get('templates')
  async getReactionTemplates() {
    return this.reactionsService.getReactionTemplates();
  }
}
