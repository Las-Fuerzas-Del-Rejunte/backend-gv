import type { Request } from 'express';
import type { User } from '@supabase/supabase-js';
import type { ProfileSummary } from './profile-summary.interface';

export interface AuthenticatedRequest extends Request {
  user?: User;
  authToken?: string;
  profile?: ProfileSummary | null;
  userRole?: string | null;
}
