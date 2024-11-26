import { HttpStatus, Type } from '@nestjs/common';
import { ApiBodyOptions, ApiHeaderOptions, ApiParamOptions, ApiQueryOptions } from '@nestjs/swagger';

export interface SwaggerDocInterface {
  // jwt 토큰 여부
  jwt?: boolean;
  // 개요(간단)
  summary: string;
  // 설명(상세)
  description: string;
  // 응답하는 형태(response-dto)
  responseType?: Type | Type[];

  responseStatus?: HttpStatus;

  //api 태그 지정
  tags?: string[];
  // 요청받은 헤더의 값
  headers?: ApiHeaderOptions | ApiHeaderOptions[];
  // 요청받은 파라미터의 값
  params?: ApiParamOptions | ApiParamOptions[];
  //요청받은 쿼리스트링의 값
  query?: ApiQueryOptions | ApiQueryOptions[];
  //요청 받은 바디의 값
  body?: ApiBodyOptions;
}
