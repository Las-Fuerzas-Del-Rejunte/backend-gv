import { SupabaseAuthGuard } from '../src/common/guards/supabase-auth.guard';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../src/database/supabase.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;
  let reflector: Reflector;
  let supabaseService: SupabaseService;
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    supabaseService = { client: { auth: { getUser: jest.fn() } } } as any;
    guard = new SupabaseAuthGuard(supabaseService, reflector);
    context = {
      switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn().mockReturnValue({ headers: { authorization: 'Bearer token' } }) }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow public route', async () => {
    (reflector.getAllAndOverride as any).mockReturnValue(true);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw if no token', async () => {
    (reflector.getAllAndOverride as any).mockReturnValue(false);
    // Mock request con .get()
    const mockRequest = {
      headers: {},
      get: jest.fn().mockReturnValue(undefined),
    };
    (context.switchToHttp as any).mockReturnValue({ getRequest: () => mockRequest });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
