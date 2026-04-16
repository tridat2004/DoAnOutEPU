import { Controller, Param, Post } from '@nestjs/common';
import { AiAssignmentService } from './ai-assignment.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireProjectPermissions } from '../auth/decorators/project-permissions.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('projects/:projectId/tasks/:taskId/ai')
export class AiRecommendationController {
  constructor(
    private readonly aiAssignmentService: AiAssignmentService,
  ) {}

  @RequireProjectPermissions('task.assign')
  @Post('recommend')
  recommendAssignee(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.aiAssignmentService.recommendAssignee(
      projectId,
      taskId,
      currentUser,
    );
  }
}