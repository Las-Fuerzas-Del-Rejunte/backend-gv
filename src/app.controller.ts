import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';
import type { HealthCheck } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  root(): { message: string; status: string; timestamp: string; endpoints: string[] } {
    return {
      message: 'Sistema de Ventas API',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/api/health',
        '/api/swagger',
        '/api/brands',
        '/api/lines',
        '/api/categories',
        '/api/clients',
        '/api/products',
        '/api/sales',
      ],
    };
  }

  @Public()
  @Get('api/health')
  check(): HealthCheck {
    return this.appService.getHealth();
  }
}
