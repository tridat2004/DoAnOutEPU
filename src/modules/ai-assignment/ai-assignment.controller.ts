import { Body, Controller, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { RecommendAssigneeDto } from './dto/recommend-assignee.dto';
import { AiAssignmentService } from './ai-assignment.service';

@ApiTags('ai-assignment')
@ApiCookieAuth('access_token')
@Controller('ai-assignment')
export class AiAssignmentController {
  constructor(private readonly aiAssignmentService: AiAssignmentService) {}

  @Post('recommend')
  recommend(@Body() body: RecommendAssigneeDto) {
    return this.aiAssignmentService.recommend(body);
  }
}
