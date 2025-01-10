import { BaseResponseDto } from '@common/common.dto';
import { CustomLogger } from '@logger/custom-logger.service';
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}

  private maskSensitiveFields(data: any) {
    const sensitiveFields = ['password', 'token', 'authorization'];
    if (typeof data !== 'object') return data;
    return Object.entries(data).reduce((acc: Record<string, any>, [key, value]) => {
      acc[key] = sensitiveFields.includes(key.toLowerCase()) ? '***' : value;
      return acc;
    }, {});
  }

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let clientMessage = 'Internal server error';
    if (exception instanceof HttpException && status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      clientMessage = (exception.getResponse() as HttpException).message;
      if (typeof clientMessage === 'object') {
        // 에러 메시지가 객체인 경우 - validation pipe에서 발생하는 에러
        clientMessage = Object.values(clientMessage)[0] as string;
      }
    }

    // exception의 세부 정보를 로깅
    const errorJson = {
      message: exception.message,
      name: exception.name,
    };

    const headers = this.maskSensitiveFields(request.headers);
    const query = request.query;
    const params = request.params;
    const body = this.maskSensitiveFields(request.body);
    const ip = request.headers['x-real-ip'] ?? request.ip;

    const userAgent = request.get('user-agent');

    const requestInfo = {
      error: errorJson,
      status,
      headers,
      query,
      params,
      body,
      ip,
      userAgent,
    };

    if (status >= 500) {
      this.logger.error('', exception.stack, 'AllExceptionsFilter', {
        method: request.method,
        path: request.url,
        status: status,
        contents: requestInfo,
      });
    } else if (status >= 400) {
      this.logger.warn('', 'AllExceptionsFilter', {
        method: request.method,
        path: request.url,
        status: status,
        contents: requestInfo,
      });
    }

    const responseBody: BaseResponseDto<null> = {
      status: status,
      message: clientMessage,
      data: null, // 에러 발생 시에는 데이터가 없음
    };

    response.status(status).json(responseBody);
  }
}
