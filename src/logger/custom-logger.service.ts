import { AppConfigService } from '@configs/app/app-config.service';
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(private readonly appConfigService: AppConfigService) {
    this.initializeLogger();
  }

  private initializeLogger() {
    // Console 로그를 위한 포맷
    const consoleFormat = combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      align(),
      printf(({ timestamp, level, message, context, trace, ...meta }) => {
        const contextStr = context ? `[${context}] ` : '';
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        const traceStr = trace ? `\nStack Trace:\n${trace}` : '';
        return `${timestamp} ${level}: ${contextStr}${message}${metaStr}${traceStr}`;
      }),
    );

    let level = 'info';
    const environment = this.appConfigService.env;
    if (environment === 'local') {
      level = 'debug';
    }

    this.logger = winston.createLogger({
      level: level,
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
      ],
    });
  }

  // log === info
  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  silly(message: string, context?: string) {
    this.logger.silly(message, { context });
  }
}
