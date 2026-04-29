import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskComment } from './task-comment.entity';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_comment_attachments')
export class TaskCommentAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => TaskComment, (comment) => comment.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'comment_id' })
  comment: TaskComment | null;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User | null;

  @Column({
    name: 'file_name',
    type: 'varchar',
    length: 255,
  })
  fileName: string;

  @Column({
    name: 'file_url',
    type: 'text',
  })
  fileUrl: string;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mimeType: string | null;

  @Column({
    name: 'size_bytes',
    type: 'integer',
    nullable: true,
  })
  sizeBytes: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}