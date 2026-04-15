import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';

import { Task } from './entities/task.entity';
import { TaskType } from './entities/task-type.entity';
import { TaskStatus } from './entities/task-status.entity';
import { Priority } from './entities/priority.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { User } from '../users/entities/user.entity';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AppErrors, AppException } from '../../common/exceptions/exception';
import { successResponse } from '../../common/response';

@Injectable()
export class TasksService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(TaskType)
    private readonly taskTypeRepository: Repository<TaskType>,

    @InjectRepository(TaskStatus)
    private readonly taskStatusRepository: Repository<TaskStatus>,

    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getTaskTypes(){
    const data = await this.taskTypeRepository.find({
      order:{ name: 'ASC'},
    });

    return successResponse({
      message: 'Lay danh sach loai task thanh cong',
      data
    })
  }
  async getTaskStatuses(){
    const data = await this.taskStatusRepository.find({
      order: { position: 'ASC', createdAt: 'ASC'}
    });

    return successResponse({
      message: 'Lay danh sach trang thai task thanh cong',
      data
    })
  }

  async getPriorites(){
    const data = await this.priorityRepository.find({
      order: {weight: 'DESC', createdAt: 'ASC'},
    })
    return successResponse({
      message:'Lay danh sach do uu tien thanh cong',
      data,
    })
  }

  async createTask(projectId: string, dto:CreateTaskDto, currentUser: AuthenticatedUser){
    const project = await this.projectRepository.findOne({
      where: { id: projectId},
    })
    if (!project) throw AppErrors.project.projectNotFound();

    const reporter = await this.userRepository.findOne({
      where: { id : currentUser.id},
    })
    if(!reporter) throw AppErrors.auth.userNotFound();
    if(!reporter.isActive) throw AppErrors.auth.accountDisabled();

    const taskType = await this.taskTypeRepository.findOne({
      where :{ id: dto.taskTypeId},
    })
    if(!taskType) throw AppErrors.task.taskTypeNotFound();

    const status = await this.taskStatusRepository.findOne({
      where:{id : dto.statusId},
    })
    if(!status) throw AppErrors.task.taskStatusNotFound();

    const priority = await this.priorityRepository.findOne({
      where: { id : dto.priorityId },
    });
    if(!priority) throw AppErrors.task.priorityNotFound();

    const assignee = dto.assigneeUserId ? await this.resolveAssignee(projectId, dto.assigneeUserId) : null;
    const parentTask = dto.parentTaskId ? await this.resolveParentTask(projectId, dto.parentTaskId) : null;

    try{
      const savedTask = await this.dataSource.transaction(async (manager) => {
        const taskCode = await this.generateNextTaskCode(project.projectKey, project.id, manager)
        const task = manager.create(Task, {
          project,
          taskCode,
          title: dto.title.trim(),
          description: dto.description?.trim() || undefined,
          taskType,
          status,
          priority,
          reporter,
          assignee: assignee || undefined,
          parentTask: parentTask || undefined,
          dueDate: dto.dueDate || undefined,
          estimatedHours: dto.estimatedHours,
        });

        return manager.save(Task, task)
      })
      return successResponse({
        message: 'Tao task thanh cong',
        data: await this.taskRepository.findOne({
          where:{id:savedTask.id},
          relations: this.taskRelations(),
        })
      })
    }catch(error){
      if(error instanceof AppException){
        throw error;
      }
      throw AppErrors.task.taskCreationFailed();
    }
  }
  async getTasks(projectId: string, currentUser: AuthenticatedUser){
    const project = await this.projectRepository.findOne({
      where: { id: projectId},
    })
    if(!project) throw AppErrors.project.projectNotFound();

    const tasks = await this.taskRepository.find({
      where:{
        project: { id: projectId },
      },
      relations: this.taskRelations(),
      order:{createdAt: 'DESC'}
    })

    return successResponse({
      message:'Lay danh sach task thanh cong',
      data: tasks,
    })
  }

  async getTaskDetails(projectId: string,taskId:string, currentUser: AuthenticatedUser){
    const task = await this.taskRepository.findOne({
      where: { id: taskId, project: { id: projectId}},
      relations: this.taskRelations(),
    });
    if(!task) throw AppErrors.task.taskNotFound();

    return successResponse({
      message: ' Lay thong tin task thanh cong',
      data: task,
    })
  }

  async updateTask(projectId: string, taskId: string, dto: UpdateTaskDto, currentUser: AuthenticatedUser){
    const task = await this.taskRepository.findOne({
      where: { id: taskId, project: { id: projectId},},
      relations: this.taskRelations(),
    });
    if(!task) throw AppErrors.task.taskNotFound();

    if(dto.title === undefined && 
      dto.description === undefined &&
      dto.taskTypeId === undefined &&
      dto.statusId === undefined &&
      dto.priorityId === undefined &&
      dto.assigneeUserId === undefined &&
      dto.parentTaskId === undefined &&
      dto.dueDate === undefined &&
      dto.estimatedHours === undefined
    ){
      throw AppErrors.task.taskUpdatePayloadEmpty();
    }
    if( dto.title !== undefined){
      const nextTitle = dto.title.trim();
      if(!nextTitle) throw AppErrors.common.validationMessages(['Tieu de khong duoc de trong']);
      task.title = nextTitle;
    }
    if(dto.description !== undefined) {
      task.description = dto.description?.trim() || null;
    }
    if(dto.taskTypeId !== undefined){
      const taskType = await this.taskTypeRepository.findOne({
        where: { id : dto.taskTypeId},
      });
      if(!taskType) throw AppErrors.task.taskTypeNotFound();
      task.taskType = taskType;
    }

    if(dto.statusId !== undefined){
      const status = await this.taskStatusRepository.findOne({
        where: { id: dto.statusId},
      });
      if(!status) throw AppErrors.task.taskStatusNotFound();
      task.status = status;
    }
    if (dto.priorityId !== undefined) {
      const priority = await this.priorityRepository.findOne({
        where: { id: dto.priorityId },
      });

      if (!priority) {
        throw AppErrors.task.priorityNotFound();
      }

      task.priority = priority;
    }

    if (dto.assigneeUserId !== undefined) {
      if (dto.assigneeUserId === null) {
        task.assignee = null;
      } else {
        task.assignee = await this.resolveAssignee(projectId, dto.assigneeUserId);
      }
    }

    if (dto.parentTaskId !== undefined) {
      if (dto.parentTaskId === null) {
        task.parentTask = null;
      } else {
        const parentTask = await this.resolveParentTask(projectId, dto.parentTaskId);

        if (parentTask.id === task.id) {
          throw AppErrors.task.invalidParentTask();
        }

        task.parentTask = parentTask;
      }
    }

    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate || null;
    }

    if (dto.estimatedHours !== undefined) {
      task.estimatedHours = dto.estimatedHours ?? null;
    }
    try{
      const updatedTask = await this.taskRepository.save(task);
      return {
        message: 'Cap nhat task thanh cong',
        data: await this.taskRepository.findOne({
          where: { id: updatedTask.id },
          relations: this.taskRelations(),
        }),
        updatedBy: currentUser.id,
      };
    }catch {
      throw AppErrors.task.taskUpdateFailed();
    }
  }
  async deleteTask(projectId: string, taskId: string, currentUser: AuthenticatedUser){
    const task = await this.taskRepository.findOne({
      where: { id : taskId, project: { id: projectId },}
    });
    if(!task ) throw AppErrors.task.taskNotFound();

    try{
      await this.taskRepository.remove(task);

      return successResponse({
        message: 'Xoa task thanh cong',
        data: {
          id: task.id,
          taskCode: task.taskCode,
          deletedBy: currentUser.id,
        }
      })
    }catch{
      throw AppErrors.task.taskDeleteFailed();
    }
  }

  private async resolveAssignee(projectId: string, assigneeUserId: string){
    const assignee = await this.userRepository.findOne({
      where: { id : assigneeUserId},
    })

    if(!assignee) throw AppErrors.task.assigneeNotFound();

    const membership = await this.projectMemberRepository.findOne({
      where : {
        project : { id : projectId},
        user: { id : assigneeUserId},
      },
    });

    if(!membership) throw AppErrors.task.assigneeNotInProject();

    return assignee;
  }

  private async resolveParentTask(projectId: string, parentTaskId: string) {
    const parentTask = await this.taskRepository.findOne({
      where: { id: parentTaskId },
      relations: {
        project: true,
      },
    });

    if (!parentTask) {
      throw AppErrors.task.parentTaskNotFound();
    }

    if (parentTask.project.id !== projectId) {
      throw AppErrors.task.parentTaskDifferentProject();
    }

    return parentTask;
  }

  private async generateNextTaskCode(
    projectKey: string,
    projectId: string,
    manager: DataSource['manager'],
  ) {
    let nextNumber = (await manager.count(Task, {
      where: { project: { id: projectId } },
    })) + 1;

    while (true) {
      const candidate = `${projectKey}-${nextNumber}`;

      const existed = await manager.findOne(Task, {
        where: { taskCode: candidate },
      });

      if (!existed) {
        return candidate;
      }

      nextNumber += 1;
    }
  }

  private taskRelations() {
    return {
      project: true,
      taskType: true,
      status: true,
      priority: true,
      reporter: true,
      assignee: true,
      parentTask: true,
    } as const;
  }

}