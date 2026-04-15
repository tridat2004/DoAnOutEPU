import { Body, Controller, Get, Param, Patch } from '@nestjs/common';

import { BoardService } from './board.service';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireProjectPermissions } from '../auth/decorators/project-permissions.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('projects/:projectId')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @RequireProjectPermissions('task.view')
  @Get('board')
  getBoard(
    @Param('projectId') projectId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.boardService.getBoard(projectId, currentUser);
  }

  @RequireProjectPermissions('task.update')
  @Patch('tasks/:taskId/status')
  updateTaskStatus(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.boardService.updateTaskStatus(
      projectId,
      taskId,
      dto,
      currentUser,
    );
  }
}