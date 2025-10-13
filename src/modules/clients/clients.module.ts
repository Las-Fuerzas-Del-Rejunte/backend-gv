import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientsRepository } from './repositories/clients.repository';
import { ClientsSupabaseAdapter } from './repositories/clients.supabase-adapter';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, ClientsRepository, ClientsSupabaseAdapter],
  exports: [ClientsService],
})
export class ClientsModule {}
