import * as Joi from 'joi';

export const validateEnv = Joi.object({
  // APP
  APP_NAME: Joi.string().required(),
  APP_ENV: Joi.string().required().valid('local', 'development', 'production', 'test'),
  APP_URL: Joi.string().uri().required(),
  APP_PORT: Joi.number().required().default(3000),
  REDIRECT_URL: Joi.string().uri().required(),

  // POSTGRES
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DATABASE: Joi.string().required(),
  POSTGRES_SCHEMA: Joi.string().required().default('public'),

  // GOOGLE
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required(),

  // KAKAO
  KAKAO_CLIENT_ID: Joi.string().required(),
  KAKAO_CALLBACK_URL: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});
