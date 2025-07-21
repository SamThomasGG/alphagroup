import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api, ApiError } from './api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment config
vi.mock('../config/env', () => ({
  env: {
    VITE_API_URL: 'http://localhost:3001',
  },
}));

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ApiError', () => {
    it('should create an ApiError with status and message', () => {
      const error = new ApiError(404, 'Not found');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('auth.login', () => {
    it('should make a POST request to /auth/login with credentials', async () => {
      const mockResponse = {
        access_token: 'token123',
        user: { id: '1', email: 'test@example.com' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.auth.login('test@example.com', 'password');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw ApiError on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: errorMessage }),
      });

      await expect(
        api.auth.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(new ApiError(401, errorMessage));
    });
  });

  describe('auth.register', () => {
    it('should make a POST request to /auth/register', async () => {
      const mockResponse = {
        access_token: 'token123',
        user: { id: '1', email: 'newuser@example.com' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.auth.register('newuser@example.com', 'password');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'newuser@example.com', password: 'password' }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('auth.me', () => {
    it('should make a GET request to /auth/me', async () => {
      const mockResponse = {
        id: '1',
        email: 'test@example.com',
        permissions: ['read'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.auth.me();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('transactions.list', () => {
    it('should make a GET request to /transactions', async () => {
      const mockTransactions = [
        { id: '1', title: 'Transaction 1', priceGBP: 100 },
        { id: '2', title: 'Transaction 2', priceGBP: 200 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactions,
      });

      const result = await api.transactions.list();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/transactions', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('transactions.create', () => {
    it('should make a POST request to /transactions', async () => {
      const transactionData = { title: 'New Transaction', priceGBP: 150 };
      const mockResponse = { id: '3', ...transactionData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.transactions.create(transactionData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/transactions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('transactions.approve', () => {
    it('should make a POST request to approve transaction', async () => {
      const transactionId = 'tx-123';
      const mockResponse = { id: transactionId, status: 'approved' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.transactions.approve(transactionId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/transactions/${transactionId}/approve`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle JSON error response', async () => {
      const errorMessage = 'Validation failed';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: errorMessage }),
      });

      await expect(api.transactions.list()).rejects.toThrow(
        new ApiError(400, errorMessage)
      );
    });

    it('should handle error response with error field', async () => {
      const errorMessage = 'Access denied';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: errorMessage }),
      });

      await expect(api.transactions.list()).rejects.toThrow(
        new ApiError(403, errorMessage)
      );
    });

    it('should handle text error response when JSON parsing fails', async () => {
      const errorText = 'Server Error';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('JSON parse error');
        },
        text: async () => errorText,
      });

      await expect(api.transactions.list()).rejects.toThrow(
        new ApiError(500, errorText)
      );
    });

    it('should use default error messages for common status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => {
          throw new Error('JSON parse error');
        },
        text: async () => {
          throw new Error('Text parse error');
        },
      });

      await expect(api.transactions.list()).rejects.toThrow(
        new ApiError(404, 'Resource not found')
      );
    });

    it('should handle unknown status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 418,
        json: async () => {
          throw new Error('JSON parse error');
        },
        text: async () => {
          throw new Error('Text parse error');
        },
      });

      await expect(api.transactions.list()).rejects.toThrow(
        new ApiError(418, 'Request failed with status 418')
      );
    });
  });
});