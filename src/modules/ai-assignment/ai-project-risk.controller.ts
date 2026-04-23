import { Controller, Get, Param } from "@nestjs/common";
import { AiAssignmentService } from "./ai-assignment.service";
import { RequireProjectPermissions } from "../auth/decorators/project-permissions.decorator";

@Controller('projects/:projectId/ai')
export class AiProjectRiskController{
    constructor(
        private readonly aiAssignmentService: AiAssignmentService
    ){}

    @RequireProjectPermissions('project.view')
    @Get('risk-summary')
    getProjectRiskSummary(
        @Param('projectId') projectId : string,
    ){
        return this.aiAssignmentService.getProjectRiskSummary(projectId);
    }

    @RequireProjectPermissions('task.view')
    @Get('task/:taskId/risk')
    getTaskRisk(
        @Param('projectId') projectId: string,
        @Param('taskId') taskId : string,
    ){
        return this.aiAssignmentService.getTaskRisk(projectId, taskId);
    }
}