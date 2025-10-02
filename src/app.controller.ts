import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { HealthCheck } from './app.service';

@Controller('api/health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  check(): HealthCheck {
    return this.appService.getHealth();
  }
}
