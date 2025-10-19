import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { ArgumentsHost, HttpException } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let httpAdapterHost: HttpAdapterHost;
  let host: ArgumentsHost;
  let response: any;
  let request: any;

  beforeEach(() => {
    response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    request = { url: '/test' };
    httpAdapterHost = {} as any;
    filter = new AllExceptionsFilter(httpAdapterHost);
    host = {
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
    } as any;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException', () => {
    const exception = new (class extends HttpException {
      constructor() { super('error', 400); }
    })();
    filter.catch(exception, host);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalled();
  });

  it('should handle generic error', () => {
    const exception = new Error('fail');
    filter.catch(exception, host);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalled();
  });
});
