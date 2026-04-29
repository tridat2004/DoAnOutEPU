import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { ToggleTaskCommentReactionDto } from './dto/toggle-task-comment-reaction.dto';
import { TaskCommentsService } from './task-comments.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireProjectPermissions } from '../auth/decorators/project-permissions.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';

type UploadedCommentFile = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
};

@Controller('projects/:projectId/tasks/:taskId/comments')
export class TaskCommentsController {
  constructor(private readonly taskCommentsService: TaskCommentsService) { }

  @RequireProjectPermissions('task.view')
  @Get()
  getComments(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.taskCommentsService.getComments(projectId, taskId, currentUser);
  }

  @RequireProjectPermissions('task.comment')
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'task-comments');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  createComment(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Body() dto: CreateTaskCommentDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFiles() files: UploadedCommentFile[] = [],
  ) {
    return this.taskCommentsService.createComment(
      projectId,
      taskId,
      dto,
      currentUser,
      files,
    );
  }

  @RequireProjectPermissions('task.comment')
  @Patch(':commentId')
  updateComment(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @Body() body: UpdateTaskCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.taskCommentsService.updateComment(projectId, taskId, commentId, body, user);
  }

  @RequireProjectPermissions('task.comment')
  @Delete(':commentId')
  deleteComment(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.taskCommentsService.deleteComment(
      projectId,
      taskId,
      commentId,
      currentUser,
    );
  }

  @RequireProjectPermissions('task.comment')
  @Post(':commentId/reactions')
  addReaction(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @Body() dto: ToggleTaskCommentReactionDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.taskCommentsService.addReaction(
      projectId,
      taskId,
      commentId,
      dto,
      currentUser,
    );
  }

  @RequireProjectPermissions('task.comment')
  @Delete(':commentId/reactions')
  removeReaction(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @Query('emoji') emoji: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.taskCommentsService.removeReaction(
      projectId,
      taskId,
      commentId,
      emoji,
      currentUser,
    );
  }
}