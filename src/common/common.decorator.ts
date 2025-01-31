import { HttpStatus, SetMetadata, type Type, applyDecorators } from '@nestjs/common';
import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { BaseResponseDto } from './common.dto';
import { SwaggerDocInterface } from './common.interface';
import { RequestUser } from './types/request-user.type';

/**
 * @brief Auth가 필요하지 않을때 데코레이터
 */
export const NOT_AUTH = Symbol('NOT_AUTH');
export const NotUserAuth = () => SetMetadata(NOT_AUTH, true);

const responseMap: Record<any, any> = {
  [HttpStatus.CREATED]: ApiCreatedResponse,
  [HttpStatus.OK]: ApiOkResponse,
};

export const ResponseDtoType = <T extends Type<unknown> | [Type<unknown>]>(t: T, status: HttpStatus) => {
  const isArray = Array.isArray(t);
  const types = isArray ? t : [t]; // responseType이 배열이면 그대로 사용, 아니면 배열로 감쌈
  const extraModels = types.map((type) => ApiExtraModels(type)); // 모든 타입에 대해 ApiExtraModels 추가

  return applyDecorators(
    ApiExtraModels(BaseResponseDto, ...types), // BaseResponseDto와 모든 타입을 추가
    responseMap[status]({
      schema: {
        title: types.map((type) => type.name).join('And'),
        allOf: [
          { $ref: getSchemaPath(BaseResponseDto) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(types[0]) }, // 배열의 아이템 타입 지정
                  }
                : { $ref: getSchemaPath(types[0]) }, // 단일 객체 타입
            },
          },
        ],
      },
    }),
    ...extraModels,
  );
};

export const GenerateSwaggerApiDoc = (swaggerDocInterface: SwaggerDocInterface) => {
  const methodDecorators: MethodDecorator[] = [];
  const {
    jwt = true,
    summary,
    description,
    responseType,
    responseStatus = HttpStatus.OK,
    headers = [],
    tags = [],
    params = [],
    query = [],
    body = {},
  } = swaggerDocInterface;
  const headerOptions = Array.isArray(headers) ? headers : [headers];

  if (jwt) methodDecorators.push(ApiBearerAuth('jwt'));

  for (const h of headerOptions) {
    methodDecorators.push(ApiHeader(h));
  }

  const paramsOptions = Array.isArray(params) ? params : [params];
  for (const p of paramsOptions) {
    methodDecorators.push(ApiParam(p));
  }

  const queryOptions = Array.isArray(query) ? query : [query];
  for (const q of queryOptions) {
    methodDecorators.push(ApiQuery(q));
  }

  if (Array.isArray(tags)) methodDecorators.push(ApiTags(...tags));

  if (body && typeof body === 'object' && Object.keys(body).length > 0) methodDecorators.push(ApiBody(body));

  if (responseType !== undefined) methodDecorators.push(ResponseDtoType(responseType, responseStatus));

  return applyDecorators(ApiOperation({ summary, description }), ...methodDecorators);
};

// Auth 데코레이터
export const UserAuth = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request: RequestUser = ctx.switchToHttp().getRequest();
  return request.user;
});
