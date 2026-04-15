import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { TaskCommentsService } from './task-comments.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireProjectPermissions } from '../auth/decorators/project-permissions.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('projects/:projectId/tasks/:taskId/comments')
export class TaskCommentsController {
  constructor(
    private readonly taskCommentsService: TaskCommentsService,
  ) {}

  @RequireProjectPermissions('task.view')
  @Get()
  getComments(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskCommentsService.getComments(projectId, taskId);
  }

  @RequireProjectPermissions('task.comment')
  @Post()
  createComment(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateTaskCommentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.taskCommentsService.createComment(
      projectId,
      taskId,
      dto,
      currentUser,
    );
  }
}