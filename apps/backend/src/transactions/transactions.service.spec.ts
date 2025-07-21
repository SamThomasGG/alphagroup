import { NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TransactionsService', () => {
  let transactionsService: TransactionsService;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      transaction: {
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    transactionsService = new TransactionsService(mockPrismaService);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all transactions with creator and approver info', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          title: 'Test Transaction 1',
          priceGBP: 100.0,
          status: 'pending',
          createdAt: new Date(),
          createdBy: {
            id: 'user-1',
            email: 'creator@example.com',
          },
          approvedBy: null,
        },
        {
          id: 'tx-2',
          title: 'Test Transaction 2',
          priceGBP: 200.0,
          status: 'approved',
          createdAt: new Date(),
          createdBy: {
            id: 'user-1',
            email: 'creator@example.com',
          },
          approvedBy: {
            id: 'user-2',
            email: 'approver@example.com',
          },
        },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await transactionsService.findAll();

      expect(result).toEqual(mockTransactions);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createTransactionDto = {
        title: 'New Transaction',
        priceGBP: 150.0,
      };
      const userId = 'user-1';
      const mockCreatedTransaction = {
        id: 'tx-new',
        title: 'New Transaction',
        priceGBP: 150.0,
        status: 'pending',
        createdAt: new Date(),
        createdById: userId,
        createdBy: {
          id: userId,
          email: 'creator@example.com',
        },
      };

      mockPrismaService.transaction.create.mockResolvedValue(mockCreatedTransaction);

      const result = await transactionsService.create(createTransactionDto, userId);

      expect(result).toEqual(mockCreatedTransaction);
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
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
    });
  });

  describe('approve', () => {
    it('should approve an existing transaction', async () => {
      const transactionId = 'tx-1';
      const userId = 'user-2';
      const mockExistingTransaction = {
        id: transactionId,
        title: 'Test Transaction',
        priceGBP: 100.0,
        status: 'pending',
      };
      const mockApprovedTransaction = {
        ...mockExistingTransaction,
        status: 'approved',
        approvedById: userId,
        approvedAt: expect.any(Date),
        createdBy: {
          id: 'user-1',
          email: 'creator@example.com',
        },
        approvedBy: {
          id: userId,
          email: 'approver@example.com',
        },
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockExistingTransaction);
      mockPrismaService.transaction.update.mockResolvedValue(mockApprovedTransaction);

      const result = await transactionsService.approve(transactionId, userId);

      expect(result).toEqual(mockApprovedTransaction);
      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: transactionId },
      });
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: transactionId },
        data: {
          approvedById: userId,
          approvedAt: expect.any(Date),
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
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      const transactionId = 'non-existent';
      const userId = 'user-2';

      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(transactionsService.approve(transactionId, userId)).rejects.toThrow(
        new NotFoundException('Transaction not found')
      );

      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: transactionId },
      });
      expect(mockPrismaService.transaction.update).not.toHaveBeenCalled();
    });
  });
});