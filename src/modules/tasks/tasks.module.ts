import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { TaskType } from './entities/task-type.entity';
import { TaskStatus } from './entities/task-status.entity';
import { Priority } from './entities/priority.entity';

import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { User } from '../users/entities/user.entity';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskMetaController } from './task-meta.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskType,
      TaskStatus,
      Priority,
      Project,
      ProjectMember,
      User,
    ]),
  ],
  controllers: [TasksController, TaskMetaController],
  providers: [TasksService],
  exports: [TasksService, TypeOrmModule],
})
export class TasksModule {}