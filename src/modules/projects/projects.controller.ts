import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiCookieAuth('access_token')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  
}
