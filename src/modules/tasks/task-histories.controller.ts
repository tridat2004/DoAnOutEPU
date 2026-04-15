import { Controller, Get, Param } from '@nestjs/common';

import { TaskHistoriesService } from './task-histories.service';
import { RequireProjectPermissions } from '../auth/decorators/project-permissions.decorator';

@Controller('projects/:projectId/tasks/:taskId/histories')
export class TaskHistoriesController {
  constructor(
    private readonly taskHistoriesService: TaskHistoriesService,
  ) {}

  @RequireProjectPermissions('task.view')
  @Get()
  getHistories(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskHistoriesService.getHistories(projectId, taskId);
  }
}