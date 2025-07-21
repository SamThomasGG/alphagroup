import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from '../schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.transaction.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    return this.prisma.transaction.create({
      data: {
        title: createTransactionDto.title,
        priceGBP: createTransactionDto.priceGBP,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async approve(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        approvedById: userId,
        approvedAt: new Date(),
        status: 'approved',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}
