import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.getToken(request);
    if (token === 'rmnxoegwdpjwcxdemxe0sqni6pmmni6uzfuhknbpvzih6zdypb') {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }

  private getToken(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
