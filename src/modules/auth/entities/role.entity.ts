import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RolePermission } from './role-permission.entity';
import { ProjectMember } from '../../projects/entities/project-member.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => ProjectMember, (projectMember) => projectMember.role)
  projectMembers: ProjectMember[];
}