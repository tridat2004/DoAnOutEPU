import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { AiAssignmentService } from "./ai-assignment.service";
import { CreateUserSkillDto } from "./dto/create-user-skill.dto";
import { UpdateUserSkillDto } from "./dto/update-user-skill.dto";

@Controller('users/:userId/skills')
export class AiAssignmentController {
  constructor(
    private readonly aiAssignmentService: AiAssignmentService,
  ) {}

  @Post()
  createSkiklls(
    @Param('userId') userId: string,
    @Body() body: CreateUserSkillDto,
  ){
    return this.aiAssignmentService.createUserSkill(userId,body);
  }

  @Get()
  getUserSkills(
    @Param('userId') userId: string,
  ){
    return this.aiAssignmentService.getUserSkills(userId);
  }

  @Patch(':skillId')
  updateUserSkill(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
    @Body() dto: UpdateUserSkillDto,
  ) {
    return this.aiAssignmentService.updateUserSkill(userId, skillId, dto);
  }

  @Delete(':skillId')
  deleteUserSkill(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
  ){
    return this.aiAssignmentService.deleteUserSkill(userId, skillId);
  }
}