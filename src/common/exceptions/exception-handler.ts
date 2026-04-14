import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppErrors, AppException, fromAppException, normalizeHttpException } from './exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    if (exception instanceof AppException) {
      res.status(exception.getStatus()).json(fromAppException(exception));
      return;
    }

    if (exception instanceof HttpException) {
      const normalized = normalizeHttpException(exception);
      res.status(normalized.status_code).json(normalized);
      return;
    }

    const details =
      exception instanceof Error ? exception.stack ?? exception.message : String(exception);

    this.logger.error(`Unhandled error on ${req.method} ${req.url}`, details);

    const fallback = AppErrors.common.internalServerError();
    res.status(fallback.getStatus()).json(fromAppException(fallback));
  }
}
