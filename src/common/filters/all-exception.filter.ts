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

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // 클라이언트에게 보낼 메시지 설정
    const clientMessage =
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : (exception as HttpException).message || 'An error occurred';

    // exception의 세부 정보를 로깅
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : exception;
    const logMessage = `\n[${request.method}] ${request.url} ${status} - Error: ${
      typeof exceptionResponse === 'object' ? JSON.stringify(exceptionResponse) : exceptionResponse
    }
Headers: ${JSON.stringify(this.maskSensitiveFields(request.headers))}
Query: ${JSON.stringify(request.query)}
Params: ${JSON.stringify(request.params)}
Body: ${JSON.stringify(this.maskSensitiveFields(request.body))}
IP: ${request.ip}
User-Agent: ${request.get('user-agent')}
`;
    if (status >= 500) {
      this.logger.error(logMessage, (exception as Error).stack, 'AllExceptionsFilter');
    } else if (status >= 400) {
      this.logger.warn(logMessage, 'AllExceptionsFilter');
    }

    const responseBody: BaseResponseDto<null> = {
      status: status,
      message: clientMessage,
      data: null, // 에러 발생 시에는 데이터가 없음
    };

    response.status(status).json(responseBody);
  }
}
