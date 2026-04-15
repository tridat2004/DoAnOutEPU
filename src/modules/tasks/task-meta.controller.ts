import { Controller, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('task-meta')
export class TaskMetaController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('types')
  getTaskTypes() {
    return this.tasksService.getTaskTypes();
  }

  @Get('statuses')
  getTaskStatuses() {
    return this.tasksService.getTaskStatuses();
  }

  @Get('priorities')
  getPriorities() {
    return this.tasksService.getPriorites();
  }
}