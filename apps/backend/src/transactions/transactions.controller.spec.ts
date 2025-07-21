import { TransactionsController } from './transactions.controller';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TransactionsController', () => {
  let transactionsController: TransactionsController;
  let mockTransactionsService: any;

  beforeEach(() => {
    mockTransactionsService = {
      findAll: vi.fn(),
      create: vi.fn(),
      approve: vi.fn(),
    };

    transactionsController = new TransactionsController(mockTransactionsService);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          title: 'Test Transaction 1',
          priceGBP: 100.0,
          status: 'pending',
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

      mockTransactionsService.findAll.mockResolvedValue(mockTransactions);

      const result = await transactionsController.findAll();

      expect(result).toEqual(mockTransactions);
      expect(mockTransactionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createTransactionDto = {
        title: 'New Transaction',
        priceGBP: 150.0,
      };
      const mockRequest = {
        user: {
          userId: 'user-1',
        },
      };
      const mockCreatedTransaction = {
        id: 'tx-new',
        title: 'New Transaction',
        priceGBP: 150.0,
        status: 'pending',
        createdBy: {
          id: 'user-1',
          email: 'creator@example.com',
        },
      };

      mockTransactionsService.create.mockResolvedValue(mockCreatedTransaction);

      const result = await transactionsController.create(createTransactionDto, mockRequest);

      expect(result).toEqual(mockCreatedTransaction);
      expect(mockTransactionsService.create).toHaveBeenCalledWith(
        createTransactionDto,
        'user-1'
      );
    });
  });

  describe('approve', () => {
    it('should approve a transaction', async () => {
      const transactionId = 'tx-1';
      const mockRequest = {
        user: {
          userId: 'user-2',
        },
      };
      const mockApprovedTransaction = {
        id: transactionId,
        title: 'Test Transaction',
        priceGBP: 100.0,
        status: 'approved',
        approvedAt: new Date(),
        createdBy: {
          id: 'user-1',
          email: 'creator@example.com',
        },
        approvedBy: {
          id: 'user-2',
          email: 'approver@example.com',
        },
      };

      mockTransactionsService.approve.mockResolvedValue(mockApprovedTransaction);

      const result = await transactionsController.approve(transactionId, mockRequest);

      expect(result).toEqual(mockApprovedTransaction);
      expect(mockTransactionsService.approve).toHaveBeenCalledWith(
        transactionId,
        'user-2'
      );
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      const transactionId = 'non-existent';
      const mockRequest = {
        user: {
          userId: 'user-2',
        },
      };

      mockTransactionsService.approve.mockRejectedValue(
        new NotFoundException('Transaction not found')
      );

      await expect(
        transactionsController.approve(transactionId, mockRequest)
      ).rejects.toThrow(NotFoundException);
      expect(mockTransactionsService.approve).toHaveBeenCalledWith(
        transactionId,
        'user-2'
      );
    });
  });
});