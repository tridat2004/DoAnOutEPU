import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ai_assignment_logs')
export class AiAssignmentLog extends BaseEntity {
  @ManyToOne(() => Task, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recommended_user_id' })
  recommendedUser!: User;

  @Column({ name: 'final_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  finalScore!: string;

  @Column({ name: 'reason_text', type: 'text', nullable: true })
  reasonText!: string | null;

  @Column({ name: 'score_breakdown_json', type: 'json', nullable: true })
  scoreBreakdownJson!: Record<string, unknown> | null;
}