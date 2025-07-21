export interface User {
  id: string;
  email: string;
  permissions: string[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Transaction {
  id: string;
  title: string;
  priceGBP: number;
  createdById: string;
  createdBy: {
    id: string;
    email: string;
  };
  createdAt: string;
  approvedById: string | null;
  approvedBy: {
    id: string;
    email: string;
  } | null;
  approvedAt: string | null;
  status: string;
}
