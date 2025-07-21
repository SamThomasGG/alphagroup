import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  loginSchema,
  registerSchema,
  LoginDto,
  RegisterDto,
} from '../schemas/auth.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.email);
    const permissions = await this.usersService.getUserPermissions(
      req.user.userId,
    );
    return {
      id: user.id,
      email: user.email,
      permissions,
    };
  }
}
