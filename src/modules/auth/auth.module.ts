import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.services';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { RedisService } from '../../shared/redis/redis.service';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';

@Module({
  imports: [UsersModule, ProjectsModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ProjectPermissionGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}