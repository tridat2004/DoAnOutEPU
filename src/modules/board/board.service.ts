import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from '../tasks/entities/task.entity';
import { TaskStatus } from '../tasks/entities/task-status.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { TaskHistoriesService } from '../tasks/task-histories.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AppErrors } from '../../common/exceptions/exception';
import { successResponse } from '../../common/response';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(TaskStatus)
    private readonly taskStatusRepository: Repository<TaskStatus>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly taskHistoriesService: TaskHistoriesService,
  ) {}

  async getBoard(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw AppErrors.project.projectNotFound();
    }

    const statuses = await this.taskStatusRepository.find({
      order: {
        position: 'ASC',
        createdAt: 'ASC',
      },
    });

    const tasks = await this.taskRepository.find({
      where: {
        project: { id: projectId },
      },
      relations: {
        status: true,
        priority: true,
        assignee: true,
        reporter: true,
        taskType: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const columns = statuses.map((status) => ({
      id: status.id,
      code: status.code,
      name: status.name,
      color: status.color,
      position: status.position,
      tasks: tasks
        .filter((task) => task.status?.id === status.id)
        .map((task) => ({
          id: task.id,
          taskCode: task.taskCode,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          estimatedHours: task.estimatedHours,
          taskType: task.taskType
            ? {
                id: task.taskType.id,
                code: task.taskType.code,
                name: task.taskType.name,
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
          reporter: task.reporter
            ? {
                id: task.reporter.id,
                fullName: task.reporter.fullName,
              }
            : null,
        })),
    }));

    return successResponse({
      message: 'Lay board thanh cong',
      data: {
        project: {
          id: project.id,
          name: project.name,
          projectKey: project.projectKey,
        },
        columns,
      },
    });
  }

  async updateTaskStatus(
    projectId: string,
    taskId: string,
    statusId: string,
    currentUser: AuthenticatedUser,
  ) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
        project: { id: projectId },
      },
      relations: {
        status: true,
        project: true,
      },
    });

    if (!task) {
      throw AppErrors.task.taskNotFound();
    }

    const nextStatus = await this.taskStatusRepository.findOne({
      where: { id: statusId },
    });

    if (!nextStatus) {
      throw AppErrors.task.taskStatusNotFound();
    }

    const changedBy = await this.userRepository.findOne({
      where: { id: currentUser.id },
    });

    if (!changedBy) {
      throw AppErrors.auth.userNotFound();
    }

    const oldStatusName = task.status?.name || null;

    task.status = nextStatus;

    const updatedTask = await this.taskRepository.save(task);

    await this.taskHistoriesService.createHistory(
      updatedTask,
      changedBy,
      'status',
      oldStatusName,
      nextStatus.name,
    );

    return successResponse({
      message: 'Cap nhat status task thanh cong',
      data: {
        id: updatedTask.id,
        status: {
          id: nextStatus.id,
          code: nextStatus.code,
          name: nextStatus.name,
          color: nextStatus.color,
          position: nextStatus.position,
        },
      },
    });
  }
}