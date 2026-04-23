import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { AppErrors } from '../../common/exceptions/exception';
import { successResponse } from '../../common/response';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getTimeline(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw AppErrors.project.projectNotFound();
    }

    const tasks = await this.taskRepository.find({
      where: {
        project: { id: projectId },
      },
      relations: {
        status: true,
        priority: true,
        assignee: true,
        taskType: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return successResponse({
      message: 'Lay du lieu timeline thanh cong',
      data: {
        project: {
          id: project.id,
          name: project.name,
          projectKey: project.projectKey,
        },
        items: tasks.map((task) => ({
          id: task.id,
          taskCode: task.taskCode,
          title: task.title,
          startDate: task.createdAt,
          dueDate: task.dueDate,
          estimatedHours: task.estimatedHours,
          status: task.status
            ? {
                id: task.status.id,
                code: task.status.code,
                name: task.status.name,
                color: task.status.color,
              }
            : null,
          priority: task.priority
            ? {
                id: task.priority.id,
                code: task.priority.code,
                name: task.priority.name,
                weight: task.priority.weight,
              }
            : null,
          assignee: task.assignee
            ? {
                id: task.assignee.id,
                fullName: task.assignee.fullName,
                avatarUrl: task.assignee.avatarUrl,
              }
            : null,
          taskType: task.taskType
            ? {
                id: task.taskType.id,
                code: task.taskType.code,
                name: task.taskType.name,
              }
            : null,
        })),
      },
    });
  }
}