import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskHistory } from './entities/task-history.entity';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { AppErrors } from '../../common/exceptions/exception';
import { successResponse } from '../../common/response';

@Injectable()
export class TaskHistoriesService {
  constructor(
    @InjectRepository(TaskHistory)
    private readonly taskHistoryRepository: Repository<TaskHistory>,
  ) {}

  async createHistory(
    task: Task,
    changedBy: User,
    fieldName: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    try {
      const history = this.taskHistoryRepository.create({
        task,
        changedBy,
        fieldName,
        oldValue,
        newValue,
      });

      return await this.taskHistoryRepository.save(history);
    } catch {
      throw AppErrors.task.historyCreationFailed();
    }
  }

  async createManyHistories(
    task: Task,
    changedBy: User,
    changes: Array<{
      fieldName: string;
      oldValue: string | null;
      newValue: string | null;
    }>,
  ) {
    if (!changes.length) {
      return;
    }

    try {
      const histories = changes.map((change) =>
        this.taskHistoryRepository.create({
          task,
          changedBy,
          fieldName: change.fieldName,
          oldValue: change.oldValue,
          newValue: change.newValue,
        }),
      );

      await this.taskHistoryRepository.save(histories);
    } catch {
      throw AppErrors.task.historyCreationFailed();
    }
  }

  async getHistories(projectId: string, taskId: string) {
    const histories = await this.taskHistoryRepository.find({
      where: {
        task: {
          id: taskId,
          project: { id: projectId },
        },
      },
      relations: {
        changedBy: true,
        task: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return successResponse({
      message: 'Lay lich su task thanh cong',
      data: histories.map((item) => ({
        id: item.id,
        fieldName: item.fieldName,
        oldValue: item.oldValue,
        newValue: item.newValue,
        changedBy: {
          id: item.changedBy.id,
          email: item.changedBy.email,
          username: item.changedBy.username,
          fullName: item.changedBy.fullName,
        },
        createdAt: item.createdAt,
      })),
    });
  }
}