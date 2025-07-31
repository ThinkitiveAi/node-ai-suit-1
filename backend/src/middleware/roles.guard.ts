import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const requiredTypes = this.reflector.get<string[]>('userTypes', context.getHandler());
    
    if (!requiredRoles && !requiredTypes) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check user type if specified
    if (requiredTypes && requiredTypes.length > 0) {
      const hasValidType = requiredTypes.includes(user.type);
      if (!hasValidType) {
        throw new ForbiddenException(`Access denied. Required user type: ${requiredTypes.join(', ')}`);
      }
    }

    // Check roles if specified
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some(role => {
        if (role === 'admin') {
          return user.role === 'Practice Owner' || user.role === 'Director';
        }
        return user.role === role;
      });

      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }
}
