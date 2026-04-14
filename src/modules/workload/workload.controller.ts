import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { WorkloadService } from './workload.service';

@ApiTags('workload')
@ApiCookieAuth('access_token')
@Controller('workload')
export class WorkloadController {
  constructor(private readonly workloadService: WorkloadService) {}

  @Get()
  summary() {
    return this.workloadService.summary();
  }
}
