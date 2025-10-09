import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from '../../database/supabase.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ProfileSummary } from '../interfaces/profile-summary.interface';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

interface ProfileRecord {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const authResponse = await this.supabaseService.client.auth.getUser(token);

    if (authResponse.error || !authResponse.data?.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user: User = authResponse.data.user;
    const profile = await this.fetchProfile(user.id);
    const resolvedRole =
      profile?.role ??
      (user.app_metadata?.role as string | undefined) ??
      (user.user_metadata?.role as string | undefined) ??
      user.role;

    request.user = user;
    request.authToken = token;
    request.profile = profile ?? null;
    request.userRole = resolvedRole ?? null;

    return true;
  }

  private async fetchProfile(userId: string): Promise<ProfileSummary | null> {
    const response = await this.supabaseService.client
      .from('profiles')
      .select('id, user_id, name, email, role, avatar')
      .eq('user_id', userId)
      .maybeSingle();

    if (response.error && response.error.code !== 'PGRST116') {
      throw new UnauthorizedException('Could not retrieve user profile');
    }

    if (!response.data) {
      return null;
    }

    const profile = response.data as ProfileRecord;

    return {
      id: profile.id,
      userId: profile.user_id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar ?? null,
    };
  }

  private extractTokenFromHeader(request: AuthenticatedRequest): string | null {
    const headerValue = request.get('authorization') ?? '';
    const [type, token] = headerValue.split(' ');

    if (type?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }
}
