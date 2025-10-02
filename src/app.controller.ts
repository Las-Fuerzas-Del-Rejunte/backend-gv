import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';
import type { HealthCheck } from './app.service';

@Controller('api/health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  check(): HealthCheck {
    return this.appService.getHealth();
  }
}
