import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAssignmentController } from './ai-assignment.controller';
import { AiAssignmentService } from './ai-assignment.service';
import { UsersModule } from '../users/users.module';
import { WorkloadModule } from '../workload/workload.module';

@Module({ imports: [HttpModule, UsersModule, WorkloadModule], controllers: [AiAssignmentController], providers: [AiAssignmentService] })
export class AiAssignmentModule {}
