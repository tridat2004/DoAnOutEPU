import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiCookieAuth('access_token')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body() body: CreateTaskDto) {
    return this.tasksService.create(body);
  }
}
