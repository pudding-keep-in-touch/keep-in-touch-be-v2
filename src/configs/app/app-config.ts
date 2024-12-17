import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME,
  env: process.env.NODE_ENV,
  url: process.env.APP_URL,
  port: process.env.APP_PORT,
  redirectUrl: process.env.REDIRECT_URL,
}));
