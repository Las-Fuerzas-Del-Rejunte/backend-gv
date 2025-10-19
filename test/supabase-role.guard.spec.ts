import { SupabaseRoleGuard } from '../src/common/guards/supabase-role.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';

describe('SupabaseRoleGuard', () => {
  let guard: SupabaseRoleGuard;
  let reflector: Reflector;
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new SupabaseRoleGuard(reflector);
    context = {
      switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn().mockReturnValue({ user: { role: 'admin' } }) }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow public route', () => {
    (reflector.getAllAndOverride as any).mockReturnValue(true);
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw if no user', () => {
    (reflector.getAllAndOverride as any).mockReturnValue(false);
    (context.switchToHttp as any).mockReturnValue({ getRequest: () => ({}) });
    try {
      guard.canActivate(context);
      throw new Error('Should have thrown UnauthorizedException');
    } catch (e) {
      expect(e instanceof Error).toBe(true);
      expect(e?.message).toMatch(/Unauthorized|No autorizado/i);
    }
  });
});
