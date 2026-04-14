import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Task } from './task.entity';

@Entity('priorities')
export class Priority extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', default: 0 })
  weight: number;

  @OneToMany(() => Task, (task) => task.priority)
  tasks: Task[];
}