import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { SuppliersRepository } from './repositories/suppliers.repository';
import { SuppliersSupabaseAdapter } from './repositories/suppliers.supabase-adapter';

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService, SuppliersRepository, SuppliersSupabaseAdapter],
  exports: [SuppliersService],
})
export class SuppliersModule {}
