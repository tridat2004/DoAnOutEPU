import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { BoardService } from './board.service';
import { RequireProjectPermissions } from '../auth/decorators/project-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('projects/:projectId')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @RequireProjectPermissions('task.view')
  @Get('board')
  getBoard(@Param('projectId') projectId: string) {
    return this.boardService.getBoard(projectId);
  }

  @RequireProjectPermissions('task.update')
  @Patch('tasks/:taskId/status')
  updateTaskStatus(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() body: { statusId: string },
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.boardService.updateTaskStatus(
      projectId,
      taskId,
      body.statusId,
      currentUser,
    );
  }
}