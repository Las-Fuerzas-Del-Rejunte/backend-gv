import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@supabase/supabase-js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';

@Injectable()
export class SupabaseRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User | undefined;

    if (!user) {
      throw new UnauthorizedException('User context missing');
    }

    const userRole = (request.userRole as Role | undefined) ??
      (user.app_metadata?.role as Role | undefined) ??
      (user.user_metadata?.role as Role | undefined) ??
      (user.role as Role | undefined);

    if (!userRole) {
      throw new UnauthorizedException('User role not found');
    }

    return requiredRoles.includes(userRole);
  }
}
