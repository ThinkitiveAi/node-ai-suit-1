/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: any = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    console.log('authHeader', authHeader);

    if (!authHeader) throw new UnauthorizedException('No token provided');
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Set user information in request object
      request.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        type: decoded.type, // 'patient' or 'provider'
        role: decoded.role, // only for providers
        specialty: decoded.specialty, // only for providers
      };

      return true;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
