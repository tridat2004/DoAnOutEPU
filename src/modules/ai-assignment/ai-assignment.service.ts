import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSkill } from './entities/user-skill.entity';
import { User } from '../users/entities/user.entity';
import { CreateUserSkillDto } from './dto/create-user-skill.dto';
import { UpdateUserSkillDto } from './dto/update-user-skill.dto';
import { AppErrors, AppException } from '../../common/exceptions/exception';
import { successResponse } from '../../common/response';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { In, Repository } from 'typeorm';

import { AiAssignmentLog } from './entities/ai-assignment-log.entity';
import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import {
  AiRecommendPayload,
  AiRecommendResponse,
} from './types/recommendation.types';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
@Injectable()
export class AiAssignmentService {
  constructor(
    @InjectRepository(UserSkill)
    private readonly userSkillRepository: Repository<UserSkill>,

    @InjectRepository(AiAssignmentLog)
    private readonly aiAssignmentLogRepository: Repository<AiAssignmentLog>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,

    private readonly httpService: HttpService,
  ) {}

  async createUserSkill(userId: string, dto: CreateUserSkillDto){
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })
    if(!user) throw AppErrors.auth.userNotFound();

    const normalizedSkillName = dto.skillName.trim().toLowerCase();

    const existingSkill = await this.userSkillRepository.findOne({
      where: {
        user : { id: userId },
        skillName: normalizedSkillName,
      },
      relations: {
        user: true,
      }
    })
    if(existingSkill) throw AppErrors.aiAssignment.skillAlreadyExists();
    try{
      const skill = this.userSkillRepository.create({
        user,
        skillName: normalizedSkillName,
        levelScore: dto.levelScore,
      });

      const savedSkill = await this.userSkillRepository.save(skill);
      return successResponse({
        message: 'Tao skill cho user thanh cong',
        data: {
          id: savedSkill.id,
          userId: user.id,
          skillName: savedSkill.skillName,
          levelScore: savedSkill.levelScore,
        }
      });
    }catch(error){
      if(error instanceof AppException){
        throw error;
      }
      throw AppErrors.aiAssignment.skillCreationFailed();
    }
  }

  async getUserSkills(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw AppErrors.auth.userNotFound();
    }

    const skills = await this.userSkillRepository.find({
      where: {
        user: { id: userId },
      },
      order: {
        levelScore: 'DESC',
        createdAt: 'ASC',
      },
    });

    return successResponse({
      message: 'Lay danh sach skill thanh cong',
      data: skills.map((skill) => ({
        id: skill.id,
        userId,
        skillName: skill.skillName,
        levelScore: skill.levelScore,
      })),
    });
  }

  async updateUserSkill(userId: string, skillId: string, dto: UpdateUserSkillDto){
    const skill = await this.userSkillRepository.findOne({
      where : {
        id: skillId,
        user: { id : userId },
      },
      relations: {
        user: true,
      }
    });
    if(!skill) throw AppErrors.aiAssignment.skillNotFound();
    if(dto.skillName === undefined && dto.levelScore === undefined){
      throw AppErrors.common.validationMessages(['Khong co du lieu hop le de cap nhat skill']);
    }

    if(dto.skillName !== undefined){
      const normalizedSkillName = dto.skillName.trim().toLowerCase();

      if(!normalizedSkillName) {
        throw AppErrors.common.validationMessages(['Skill name khong duoc de trong']);
      }
      const duplicateSkill = await this.userSkillRepository.findOne({
        where:{
          user: { id: userId },
          skillName: normalizedSkillName,
        },
        relations: {
          user: true,
        }
      });
      if(duplicateSkill && duplicateSkill.id !== skill.id){
        throw AppErrors.aiAssignment.skillAlreadyExists();
      }

      skill.skillName = normalizedSkillName;
    }

    if (dto.levelScore !== undefined){
      skill.levelScore = dto.levelScore;
    }

    try {
      const updatedSkill = await this.userSkillRepository.save(skill);

      return successResponse({
        message: 'Cap nhat skill thanh cong',
        data: {
          id:updatedSkill.id,
          userId,
          skillName: updatedSkill.skillName,
          levelScore: updatedSkill.levelScore,
        }
      })
    }catch{
      throw AppErrors.aiAssignment.skillUpdateFailed();
    }
  }

  async deleteUserSkill(userId: string, skillId: string){
    const skill = await this.userSkillRepository.findOne({
      where: {
        id: skillId,
        user : { id: userId },
      },
      relations : {
        user: true
      }
    });
    if(!skill) throw AppErrors.aiAssignment.skillNotFound();
    try {
      await this.userSkillRepository.remove(skill);

      return successResponse({
        message: 'Xoa skill thanh cong',
        data: {
          id: skill.id,
          userId,
        },
      });
    } catch {
      throw AppErrors.aiAssignment.skillDeletionFailed();
    }
  }

  async recommendAssignee(projectId: string, taskId: string, currentUser: AuthenticatedUser){
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if(!project) throw AppErrors.project.projectNotFound();

    const task = await this.taskRepository.findOne({
      where: {
        id : taskId,
        project: {id: projectId},
      },
      relations :{
        project: true,
        taskType: true,
        priority: true,
        reporter: true,
        assignee: true,
      }
    });
    if(!task) throw AppErrors.task.taskNotFound();

    const members = await this.projectMemberRepository.find({
      where: {
        project: { id: projectId },
      },
      relations: {
        user: true, 
        role: true,
      }
    })
    if(!members.length) throw AppErrors.aiAssignment.noCandidates();
    const userIds = members.map((member) => member.user.id);

    const skills = await this.userSkillRepository.find({
      where: {
        user: { id: In(userIds) },
      },
      relations: {
        user: true,
      }
    })
    const workloadRows = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.assignee_user_id', 'userId')
      .addSelect('COUNT(task.id)', 'openCount' )
      .leftJoin('task.status', 'status')
      .where('task.project_id = :projectId', { projectId })
      .andWhere('task.assignee_user_id IS NOT NULL')
      .andWhere('status.code != :done', { done : 'done'})
      .groupBy('task.assignee_user_id')
      .getRawMany<{ userId: string; openCount: number }>();
    
      const workloadMap = new Map<string, number>(
        workloadRows.map((row) => [row.userId, Number(row.openCount)]),
      );

      const payload  = this.buildRecommendationPayload(task, members, skills, workloadMap);
      const aiResult = await this.callAiRecommendService(payload);

      const recommendedMember = members.find(
        (members) => members.user.id === aiResult.recommendedUserId,
      )
      if(!recommendedMember) throw AppErrors.aiAssignment.invalidRecommendation();
      try{
        const log = this.aiAssignmentLogRepository.create({
          task,
          recommendedUser: recommendedMember.user,
          finalScore: String(aiResult.finalScore),
          reasonText: aiResult.reasonText || null,
          scoreBreakdownJson: aiResult.scoreBreakdownJson || null,
        });

        const savedLog = await this.aiAssignmentLogRepository.save(log);
        return successResponse({
          message: 'AI goi y nguoi phu hop thanh cong',
          data: {
            logId: savedLog.id,
            task: {
              id: task.id,
              taskCode: task.taskCode,
              title: task.title,
            },
            recommendedUser: {
              id: recommendedMember.user.id,
              email: recommendedMember.user.email,
              username: recommendedMember.user.username,
              fullName: recommendedMember.user.fullName,
              role: recommendedMember.role.code,
            },
            finalScore: aiResult.finalScore,
            reasonText: aiResult.reasonText,
            scoreBreakdownJson: aiResult.scoreBreakdownJson,
            topCandidates: aiResult.topCandidates || [],
            requestedBy: currentUser.id,
          },
        });
      }catch (error) {
        console.error('AI LOG SAVE ERROR:', error);
        throw AppErrors.aiAssignment.recommendationLogFailed();
      }

  }
  private buildRecommendationPayload(
    task: Task,
    members: ProjectMember[],
    skills: UserSkill[],
    workloadMap: Map<string, number>,
  ): AiRecommendPayload {
    const skillMap = new Map<
      string,
      Array<{
        skillName: string;
        levelScore: number;
      }>
    >();

    for (const skill of skills) {
      const userId = skill.user.id;

      if (!skillMap.has(userId)) {
        skillMap.set(userId, []);
      }

      skillMap.get(userId)!.push({
        skillName: skill.skillName,
        levelScore: skill.levelScore,
      });
    }

    return {
      task: {
        id: task.id,
        title: task.title,
        description: task.description || null,
        taskType: task.taskType.name,
        priority: task.priority.name,
      },
      candidates: members.map((member) => ({
        userId: member.user.id,
        fullName: member.user.fullName,
        email: member.user.email,
        role: member.role.code,
        skills: skillMap.get(member.user.id) || [],
        openTasksCount: workloadMap.get(member.user.id) || 0,
        isCurrentAssignee: task.assignee?.id === member.user.id,
      })),
    };
  }
  
  private async callAiRecommendService(payload : AiRecommendPayload): Promise<AiRecommendResponse>{
    const baseUrl = process.env.AI_AGENT_BASE_URL;

    if(!baseUrl){
      throw AppErrors.aiAssignment.aiServiceCallFailed();
    }

    try{
      const response = await firstValueFrom(
        this.httpService.post(`${baseUrl}/api/v1/recommend`, payload, { timeout: 15000 }),
      );

      const data = response.data;

      if(!data?.recommendedUserId )  throw AppErrors.aiAssignment.invalidRecommendation();

      return data;
    }catch(error){
      if(error instanceof AppException){
        throw error;
      }
      throw AppErrors.aiAssignment.aiServiceCallFailed();
    }
  }
}