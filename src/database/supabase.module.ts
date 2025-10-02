import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (configService: ConfigService): SupabaseClient => {
        const url = configService.get<string>('SUPABASE_URL');
        const serviceRoleKey =
          configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ??
          configService.get<string>('SUPABASE_ANON_KEY') ??
          configService.get<string>('SUPABASE_API_KEY');

        if (!url || !serviceRoleKey) {
          throw new Error(
            'Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY/SUPABASE_API_KEY).',
          );
        }

        return createClient(url, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
      },
      inject: [ConfigService],
    },
    SupabaseService,
  ],
  exports: [SupabaseService],
})
export class SupabaseModule {}
