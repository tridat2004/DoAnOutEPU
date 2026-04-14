import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { RecommendAssigneeDto } from './dto/recommend-assignee.dto';
import { UsersService } from '../users/users.service';
import { WorkloadService } from '../workload/workload.service';

@Injectable()
export class AiAssignmentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
    private readonly workloadService: WorkloadService,
  ) {}

  async recommend(body: RecommendAssigneeDto) {
    const payload = {
      task: body,
      members: this.usersService.findAll(),
      workload: this.workloadService.summary(),
    };

    const baseUrl = process.env.AI_AGENT_BASE_URL || 'http://localhost:8001';
    const response = await firstValueFrom(
      this.httpService.post(`${baseUrl}/api/v1/recommend`, payload),
    );

    return response.data;
  }
}
