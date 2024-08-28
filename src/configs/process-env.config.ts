import * as Joi from 'joi';

export function validateEnv() {
  return Joi.object({
    APP_ENV: Joi.valid('local', 'dev', 'prod').default('local').required(),

    POSTGRES_HOST: Joi.string().required(),
    POSTGRES_PORT: Joi.number().required(),
    POSTGRES_USERNAME: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_DATABASE: Joi.string().required(),
  });
}
