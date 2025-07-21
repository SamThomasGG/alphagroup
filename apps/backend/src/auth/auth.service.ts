import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const existingUser = await this.usersService.findOne(email);
    if (!existingUser) {
      throw new UnauthorizedException(
        'User not found. Please check your email address.',
      );
    }

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Incorrect password. Please try again.');
    }

    const permissions = await this.usersService.getUserPermissions(user.id);

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        permissions,
      },
    };
  }

  async register(email: string, password: string) {
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new UnauthorizedException(
        'An account with this email already exists. Please try logging in instead.',
      );
    }

    const user = await this.usersService.create(email, password);
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        permissions: [],
      },
    };
  }
}
