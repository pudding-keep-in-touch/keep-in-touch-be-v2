import { registerAs } from '@nestjs/config';

export default registerAs('swaggerStats', () => ({
  username: process.env.SWAGGER_STATS_USERNAME,
  password: process.env.SWAGGER_STATS_PASSWORD,
}));
