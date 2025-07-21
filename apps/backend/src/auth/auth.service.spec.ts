import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';

vi.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockUsersService = {
      findOne: vi.fn(),
      create: vi.fn(),
      getUserPermissions: vi.fn(),
    };

    mockJwtService = {
      sign: vi.fn(),
    };

    // Create instance directly instead of using TestingModule
    authService = new AuthService(mockUsersService, mockJwtService);

    vi.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as MockedFunction<typeof bcrypt.compare>).mockResolvedValue(true as never);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return null if user does not exist', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
      expect(mockUsersService.findOne).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as MockedFunction<typeof bcrypt.compare>).mockResolvedValue(false as never);

      const result = await authService.validateUser('test@example.com', 'wrongPassword');

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    });
  });

  describe('login', () => {
    it('should return access token and user data on successful login', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      const mockPermissions = ['read', 'write'];
      const mockToken = 'mock-jwt-token';

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as MockedFunction<typeof bcrypt.compare>).mockResolvedValue(true as never);
      mockUsersService.getUserPermissions.mockResolvedValue(mockPermissions);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login('test@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: 1,
          email: 'test@example.com',
          permissions: mockPermissions,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 1,
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow(
        new UnauthorizedException('User not found. Please check your email address.')
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as MockedFunction<typeof bcrypt.compare>).mockResolvedValue(false as never);

      await expect(
        authService.login('test@example.com', 'wrongPassword')
      ).rejects.toThrow(
        new UnauthorizedException('Incorrect password. Please try again.')
      );
    });
  });

  describe('register', () => {
    it('should create new user and return access token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      const mockToken = 'mock-jwt-token';

      mockUsersService.findOne.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.register('test@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: 1,
          email: 'test@example.com',
          permissions: [],
        },
      });
      expect(mockUsersService.create).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUsersService.findOne.mockResolvedValue(existingUser);

      await expect(
        authService.register('test@example.com', 'password')
      ).rejects.toThrow(
        new UnauthorizedException(
          'An account with this email already exists. Please try logging in instead.'
        )
      );

      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });
});