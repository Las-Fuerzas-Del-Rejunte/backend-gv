import { Module } from '@nestjs/common';
import { LinesController } from './lines.controller';
import { LinesService } from './lines.service';
import { LinesRepository } from './repositories/lines.repository';

@Module({
  controllers: [LinesController],
  providers: [LinesService, LinesRepository],
  exports: [LinesService],
})
export class LinesModule {}
