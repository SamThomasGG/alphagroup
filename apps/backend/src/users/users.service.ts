import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
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
  }

  async create(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
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

    if (!user) return [];

    const permissions = new Set<string>();

    user.roles.forEach((userRole) => {
      userRole.role.permissions.forEach((permission) => {
        permissions.add(permission.name);
      });
    });

    return Array.from(permissions);
  }
}
