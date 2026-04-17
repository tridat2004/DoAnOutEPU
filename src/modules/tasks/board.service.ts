import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './entities/task.entity';
import { TaskStatus } from './entities/task-status.entity';
import { Project } from '../projects/entities/project.entity';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { AppErrors } from '../../common/exceptions/exception';
import { successResponse } from '../../common/response';
import { User } from '../users/entities/user.entity';
import { TaskHistoriesService } from './task-histories.service';
import { NotificationsService } from '../notifications/notifications.service';
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
        private readonly notificationsService: NotificationsService,
    ) { }
    async getBoard(projectId: string, user: AuthenticatedUser) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId }
        });
        if (!project) throw AppErrors.project.projectNotFound();

        try {
            const statuses = await this.taskStatusRepository.find({
                order: {
                    position: 'ASC',
                    createdAt: 'ASC',
                }
            });

            const tasks = await this.taskRepository.find({
                where: {
                    project: { id: projectId },
                },
                relations: {
                    project: true,
                    taskType: true,
                    status: true,
                    priority: true,
                    reporter: true,
                    assignee: true,
                    parentTask: true,
                },
                order: {
                    createdAt: 'DESC',
                }
            });
            const column = statuses.map((status) => ({
                status: {
                    id: status.id,
                    code: status.code,
                    name: status.name,
                    color: status.color,
                    position: status.position,
                },
                task: tasks.filter((task) => task.status.id === status.id),
            }));
            return successResponse({
                message: 'Lay du lieu board thanh cong',
                data: {
                    project: {
                        id: project.id,
                        name: project.name,
                        projectKey: project.projectKey,
                    },
                    column,
                }
            })
        } catch {
            throw AppErrors.task.boardLoadFailed();
        }
    }

    async updateTaskStatus(
        projectId: string,
        taskId: string,
        dto: UpdateTaskStatusDto,
        currentUser: AuthenticatedUser,
    ) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw AppErrors.project.projectNotFound();
        }

        const task = await this.taskRepository.findOne({
            where: {
                id: taskId,
                project: { id: projectId },
            },
            relations: {
                project: true,
                taskType: true,
                status: true,
                priority: true,
                reporter: true,
                assignee: true,
                parentTask: true,
            },
        });

        if (!task) {
            throw AppErrors.task.taskNotFound();
        }

        const nextStatus = await this.taskStatusRepository.findOne({
            where: { id: dto.statusId },
        });

        if (!nextStatus) {
            throw AppErrors.task.taskStatusNotFound();
        }

        const updatedByUser = await this.userRepository.findOne({
            where: { id: currentUser.id },
        });

        if (!updatedByUser) {
            throw AppErrors.auth.userNotFound();
        }

        if (!updatedByUser.isActive) {
            throw AppErrors.auth.accountDisabled();
        }

        const oldStatusName = task.status.name;

        if (task.status.id === nextStatus.id) {
            return successResponse({
                message: 'Trang thai task khong thay doi',
                data: {
                    id: task.id,
                    taskCode: task.taskCode,
                    title: task.title,
                    status: {
                        id: nextStatus.id,
                        code: nextStatus.code,
                        name: nextStatus.name,
                        color: nextStatus.color,
                        position: nextStatus.position,
                    },
                    updatedBy: currentUser.id,
                },
            });
        }

        task.status = nextStatus;

        try {
            const updatedTask = await this.taskRepository.save(task);

            await this.taskHistoriesService.createHistory(
                updatedTask,
                updatedByUser,
                'status',
                oldStatusName,
                nextStatus.name,
            );
            if (updatedTask.assignee && updatedTask.assignee.id !== currentUser.id) {
                await this.notificationsService.createAndPush(updatedTask.assignee.id, {
                    type: 'task_status_changed',
                    title: 'Task status updated',
                    message: `Task ${updatedTask.taskCode} was moved from ${oldStatusName} to ${nextStatus.name}`,
                    relatedUrl: `/projects/${projectId}/tasks/${taskId}`,
                    metadataJson: {
                    projectId,
                    taskId,
                    fromStatus: oldStatusName,
                    toStatus: nextStatus.name,
                    },
                });
            }
            return successResponse({
                message: 'Cap nhat trang thai task thanh cong',
                data: {
                    id: updatedTask.id,
                    taskCode: updatedTask.taskCode,
                    title: updatedTask.title,
                    status: {
                        id: nextStatus.id,
                        code: nextStatus.code,
                        name: nextStatus.name,
                        color: nextStatus.color,
                        position: nextStatus.position,
                    },
                    updatedBy: currentUser.id,
                },
            });
        } catch {
            throw AppErrors.task.taskStatusUpdateFailed();
        }
    }
}