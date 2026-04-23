import { Controller, Get, Param } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { RequireProjectPermissions } from '../auth/decorators/project-permissions.decorator';

@Controller('projects/:projectId')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @RequireProjectPermissions('task.view')
  @Get('timeline')
  getTimeline(@Param('projectId') projectId: string) {
    return this.timelineService.getTimeline(projectId);
  }
}