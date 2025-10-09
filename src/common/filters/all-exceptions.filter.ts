import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url ?? 'unknown',
      message: this.extractMessage(exception),
    };

    if (!(exception instanceof HttpException)) {
      // Surface unexpected errors to the logs for observability

      console.error(exception);
    }

    response.status(status).json(responseBody);
  }

  private extractMessage(exception: unknown): string | Record<string, unknown> {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string' ? response : { ...response };
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Unexpected error';
  }
}
