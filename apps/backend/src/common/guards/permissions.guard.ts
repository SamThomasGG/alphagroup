import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredPermissions) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (!user) {
        return false;
      }

      const userPermissions = await this.usersService.getUserPermissions(
        user.userId,
      );

      return requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );
    } catch (err) {
      return false;
    }
  }
}
