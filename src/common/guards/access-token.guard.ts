import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AppErrors } from '../exceptions/exception';
import { AuthService } from '../../modules/auth/auth.services';
import { IS_PUBLIC_KEY } from '../../modules/auth/constants/auth.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies?.access_token;

    if (!accessToken) {
      throw AppErrors.auth.accessTokenMissing();
    }

    const user = await this.authService.validateAccessToken(accessToken);
    request.user = user;

    return true;
  }
}
