import { env } from '../config/env';

const API_URL = env.VITE_API_URL;

// Token storage
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  return authToken;
};

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Merge with existing headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If JSON parsing fails, try to get text
      try {
        errorMessage = await response.text();
      } catch {
        // Use status-based error messages as fallback
        switch (response.status) {
          case 401:
            errorMessage = 'Invalid email or password';
            break;
          case 403:
            errorMessage = 'Access denied';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Request failed with status ${response.status}`;
        }
      }
    }

    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string) =>
      fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => fetchWithAuth('/auth/me'),
  },
  transactions: {
    list: () => fetchWithAuth('/transactions'),
    create: (data: { title: string; priceGBP: number }) =>
      fetchWithAuth('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    approve: (id: string) =>
      fetchWithAuth(`/transactions/${id}/approve`, {
        method: 'POST',
      }),
  },
};
