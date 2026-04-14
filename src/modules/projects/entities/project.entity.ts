import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ProjectMember } from './project-member.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('projects')
export class Project extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ name: 'project_key', type: 'varchar', length: 20 })
  projectKey: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.ownedProjects, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @OneToMany(() => ProjectMember, (projectMember) => projectMember.project)
  projectMembers: ProjectMember[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}