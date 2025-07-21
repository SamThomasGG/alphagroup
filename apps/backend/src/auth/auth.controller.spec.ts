import { AuthController } from './auth.controller';
import { UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: any;
  let mockUsersService: any;

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
    };

    mockUsersService = {
      findOne: vi.fn(),
      getUserPermissions: vi.fn(),
    };

    authController = new AuthController(mockAuthService, mockUsersService);
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token and user data on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const expectedResult = {
        access_token: 'mock-jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          permissions: ['read', 'write'],
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Incorrect password. Please try again.')
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
    });
  });

  describe('register', () => {
    it('should create new user and return access token', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password',
      };
      const expectedResult = {
        access_token: 'mock-jwt-token',
        user: {
          id: 'user-new',
          email: 'newuser@example.com',
          permissions: [],
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await authController.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password
      );
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password',
      };

      mockAuthService.register.mockRejectedValue(
        new UnauthorizedException(
          'An account with this email already exists. Please try logging in instead.'
        )
      );

      await expect(authController.register(registerDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile with permissions', async () => {
      const mockRequest = {
        user: {
          email: 'test@example.com',
          userId: 'user-1',
        },
      };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      const mockPermissions = ['read', 'write', 'delete'];

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.getUserPermissions.mockResolvedValue(mockPermissions);

      const result = await authController.getProfile(mockRequest);

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        permissions: mockPermissions,
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(mockUsersService.getUserPermissions).toHaveBeenCalledWith('user-1');
    });
  });
});