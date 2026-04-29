import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';
import { TaskComment } from './task-comment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_comment_reactions')
@Unique('UQ_task_comment_reactions_comment_user_emoji', ['comment', 'user', 'emoji'])
export class TaskCommentReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TaskComment, (comment) => comment.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: TaskComment;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'emoji',
    type: 'varchar',
    length: 16,
  })
  emoji: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}