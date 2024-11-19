import * as Joi from 'joi';

export const validateEnv = Joi.object({
  APP_NAME: Joi.string().required(),
  APP_ENV: Joi.string().required().valid('local', 'development', 'production', 'test'),
  APP_PORT: Joi.number().required().default(3000),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DATABASE: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required(),
  GOOGLE_CALLBACK_URL_V2: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  // 필요한 경우 다른 환경 변수들도 추가
});
