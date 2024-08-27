import { SetMetadata } from '@nestjs/common';

/**
 * @brief Auth가 필요하지 않을때 데코레이터
 */
export const NOT_AUTH = Symbol('NOT_AUTH');
export const NotUserAuth = () => SetMetadata(NOT_AUTH, true);
