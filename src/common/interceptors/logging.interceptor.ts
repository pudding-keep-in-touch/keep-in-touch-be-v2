import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLogger } from 'src/logger/custom-logger.service';

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
    const responseTime = Math.round(performance.now() - now);

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`[${method}] ${url} ${statusCode} +${responseTime}ms`, 'LoggingInterceptor');
        },
      }),
    );
  }
}
