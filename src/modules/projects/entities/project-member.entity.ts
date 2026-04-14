import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../auth/entities/role.entity';

@Entity('project_members')
@Unique('uq_project_members_project_user', ['project', 'user'])
export class ProjectMember extends BaseEntity {
  @ManyToOne(() => Project, (project) => project.projectMembers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, (user) => user.projectMembers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.projectMembers, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'joined_at', type: 'timestamp', nullable: true })
  joinedAt?: Date;
}