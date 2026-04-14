import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@ApiCookieAuth('access_token')
@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok', service: 'task-core-service' };
  }
}
