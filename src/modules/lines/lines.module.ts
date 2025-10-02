import { Module } from '@nestjs/common';
import { LinesController } from './lines.controller';
import { LinesService } from './lines.service';
import { LinesRepository } from './repositories/lines.repository';
import { LinesSupabaseAdapter } from './repositories/lines.supabase-adapter';

@Module({
  controllers: [LinesController],
  providers: [LinesService, LinesRepository, LinesSupabaseAdapter],
  exports: [LinesService],
})
export class LinesModule {}
