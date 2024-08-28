import { Controller, Get } from '@nestjs/common';

@Controller('messages')
export class MessagesController {
  @Get('')
  async getMessages() {
    return 'hello messages';
  }
}
