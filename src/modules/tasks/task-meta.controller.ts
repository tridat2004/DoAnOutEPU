import { Body, Controller, Get, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskTypeDto } from './dto/create-task-type.dto';
import { CreateTaskStatusDto } from './dto/create-task-status.dto';
import { CreatePriorityDto } from './dto/create-priority.dto';

@Controller('task-meta')
export class TaskMetaController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('types')
  createTaskType(@Body() dto: CreateTaskTypeDto) {
    return this.tasksService.createTaskType(dto);
  }

  @Get('types')
  getTaskTypes() {
    return this.tasksService.getTaskTypes();
  }

  @Post('statuses')
  createTaskStatus(@Body() dto: CreateTaskStatusDto) {
    return this.tasksService.createTaskStatus(dto);
  }

  @Get('statuses')
  getTaskStatuses() {
    return this.tasksService.getTaskStatuses();
  }

  @Post('priorities')
  createPriority(@Body() dto: CreatePriorityDto) {
    return this.tasksService.createPriority(dto);
  }

  @Get('priorities')
  getPriorities() {
    return this.tasksService.getPriorites();
  }
}