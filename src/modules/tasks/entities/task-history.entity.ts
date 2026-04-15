import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_histories')
export class TaskHistory extends BaseEntity {
  @ManyToOne(() => Task, (task) => task.histories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @ManyToOne(() => User, (user) => user.taskHistories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'changed_by_user_id' })
  changedBy!: User;

  @Column({ name: 'field_name', type: 'varchar', length: 100 })
  fieldName!: string;

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue!: string | null;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue!: string | null;
}