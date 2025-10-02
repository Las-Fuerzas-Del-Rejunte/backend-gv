import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const http = host.switchToHttp();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(http.getRequest()),
      message: this.extractMessage(exception),
    };

    if (!(exception instanceof HttpException)) {
      // Surface unexpected errors to the logs for observability
      console.error(exception);
    }

    httpAdapter.reply(http.getResponse(), responseBody, status);
  }

  private extractMessage(exception: unknown): string | object {
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
