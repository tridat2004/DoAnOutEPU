import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectMembersService } from './project-members.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember])],
  providers: [ProjectMembersService],
  exports: [ProjectMembersService, TypeOrmModule],
})
export class ProjectsModule {}