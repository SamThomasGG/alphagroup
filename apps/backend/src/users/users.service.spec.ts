import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';

vi.mock('bcrypt');

describe('UsersService', () => {
  let usersService: UsersService;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    usersService = new UsersService(mockPrismaService);
    vi.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a user with roles and permissions', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        roles: [
          {
            role: {
              id: 'role-1',
              name: 'admin',
              permissions: [
                { id: 'perm-1', name: 'read' },
                { id: 'perm-2', name: 'write' },
              ],
            },
          },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findOne('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return null if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await usersService.findOne('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const email = 'newuser@example.com';
      const password = 'plainPassword';
      const hashedPassword = 'hashedPassword';
      const mockCreatedUser = {
        id: 'user-new',
        email,
        password: hashedPassword,
      };

      (bcrypt.hash as MockedFunction<typeof bcrypt.hash>).mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await usersService.create(email, password);

      expect(result).toEqual(mockCreatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: hashedPassword,
        },
      });
    });
  });

  describe('getUserPermissions', () => {
    it('should return unique permissions from all user roles', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        roles: [
          {
            role: {
              permissions: [
                { name: 'read' },
                { name: 'write' },
              ],
            },
          },
          {
            role: {
              permissions: [
                { name: 'write' }, // Duplicate permission
                { name: 'delete' },
              ],
            },
          },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.getUserPermissions(userId);

      expect(result).toEqual(expect.arrayContaining(['read', 'write', 'delete']));
      expect(result).toHaveLength(3); // Should be unique
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return empty array if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await usersService.getUserPermissions('non-existent');

      expect(result).toEqual([]);
    });

    it('should return empty array if user has no roles', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        roles: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.getUserPermissions('user-1');

      expect(result).toEqual([]);
    });
  });
});