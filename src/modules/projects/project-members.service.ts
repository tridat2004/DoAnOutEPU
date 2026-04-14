import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from './entities/project-member.entity';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  findByProjectAndUser(projectId: string, userId: string) {
    return this.projectMemberRepository.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
      },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
        project: true,
        user: true,
      },
    });
  }
}