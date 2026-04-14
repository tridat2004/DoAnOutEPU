import { Permission } from '../modules/auth/entities/permission.entity';
import { RolePermission } from '../modules/auth/entities/role-permission.entity';
import { Role } from '../modules/auth/entities/role.entity';
import { ProjectMember } from '../modules/projects/entities/project-member.entity';
import { Project } from '../modules/projects/entities/project.entity';
import { Priority } from '../modules/tasks/entities/priority.entity';
import { TaskStatus } from '../modules/tasks/entities/task-status.entity';
import { TaskType } from '../modules/tasks/entities/task-type.entity';
import { Task } from '../modules/tasks/entities/task.entity';
import { User } from '../modules/users/entities/user.entity';

export const databaseEntities = [
  User,
  Role,
  Permission,
  RolePermission,
  Project,
  ProjectMember,
  TaskType,
  TaskStatus,
  Priority,
  Task,
] as const;
