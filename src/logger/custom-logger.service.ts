import { AppConfigService } from '@configs/app/app-config.service';
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

type HttpMetaData = {
  method: string;
  path: string;
  status: number;
  duration?: string;
  contents?: object;
};

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(private readonly appConfigService: AppConfigService) {
    this.initializeLogger();
  }

  private formatMetadata(metadata: object): string {
    return Object.entries(metadata)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          // logfmt 형식에서 "key=value" 형태로 출력하기 위해 JSON.stringify를 두 번 사용
          // ex) key="{\"key\":\"value\"}"
          return `${key}=${JSON.stringify(JSON.stringify(value))}`;
        }
        return `${key}="${value}"`;
      })
      .join(' ');
  }

  private initializeLogger() {
    // for local, test etc
    const developmentFormat = combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      align(),
      printf(({ timestamp, level, message, context, trace, ...meta }) => {
        const contextStr = context ? `[${context}] ` : '';
        let metaStr = '';

        if (meta?.method && meta?.path && meta?.status) {
          metaStr = `[${meta.method}] ${meta.path} ${meta.status}${meta.duration ? ` +${meta.duration}` : ''}`;
        }
        if (meta?.contents) {
          // map contents to string
          const contents = meta.contents as any;
          for (const key in contents) {
            metaStr += `\n${key}: ${JSON.stringify(contents[key])}`;
          }
        }
        const traceStr = trace ? `\nStack Trace: ${trace}` : '';
        return `${timestamp} ${level}: ${contextStr}${metaStr}${traceStr}${message}`;
      }),
    );

    // for production environment
    const productionFormat = combine(
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      printf(({ timestamp, level, message, context, ...meta }) => {
        const format = `time="${timestamp}" level="${level}" context="${context}" ${this.formatMetadata(meta)} ${message}`;
        return format.replace(/\s+/g, ' ');
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
          format: environment === 'production' || environment === 'development' ? productionFormat : developmentFormat,
        }),
      ],
    });
  }

  // log === info
  log(message: string, context?: string, meta?: HttpMetaData) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: HttpMetaData) {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(message: string, context?: string, meta?: HttpMetaData) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: HttpMetaData) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: HttpMetaData) {
    this.logger.verbose(message, { context, ...meta });
  }

  silly(message: string, context?: string, meta?: HttpMetaData) {
    this.logger.silly(message, { context, ...meta });
  }
}
