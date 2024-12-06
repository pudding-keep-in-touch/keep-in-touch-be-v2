import { CustomLogger } from '@logger/custom-logger.service';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    if (url === '/health') {
      return next.handle();
    }
    const method = request.method;
    const now = performance.now();
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Math.round(performance.now() - now);
          this.logger.log(`[${method}] ${url} ${statusCode} +${responseTime}ms`, 'LoggingInterceptor');
        },
      }),
    );
  }
}
