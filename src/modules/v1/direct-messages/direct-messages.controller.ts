import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('direct-messages')
@Controller('direct-messages')
export class DirectMessagesController {}
