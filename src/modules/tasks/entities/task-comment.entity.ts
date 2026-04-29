import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';
import { OneToMany } from 'typeorm'
import { TaskCommentAttachment } from './task-comment-attachment.entity'
import { TaskCommentReaction } from './task-comment-reaction.entity';
@Entity('task_comments')
export class TaskComment extends BaseEntity {
  @ManyToOne(() => Task, (task) => task.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @ManyToOne(() => User, (user) => user.taskComments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_user_id' })
  author!: User;

  @Column({ type: 'text' })
  content!: string;

  @OneToMany(() => TaskCommentAttachment, (attachment) => attachment.comment, {
    cascade: true,
  })
  attachments: TaskCommentAttachment[]

  @OneToMany(() => TaskCommentReaction, (reaction) => reaction.comment, {
    cascade: true,
  })
  reactions: TaskCommentReaction[];
}