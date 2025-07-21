# AlphaGroup Test Part 1

## Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment setup**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

3. **Generate Prisma client**
   ```bash
   cd apps/backend
   pnpm prisma generate --schema=./src/prisma/schema.prisma
   ```
   
4. **Build and start both frontend and backend (in project root)**
   ```bash
   pnpm run start
   ```
   
### Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001


## Test Users

| Email | Password | Permissions |
|-------|----------|-------------|
| `inputter@example.com` | `password123` | Create and view transactions |
| `approver@example.com` | `password123` | View and approve transactions |
| `auditor@example.com` | `password123` | View transactions only |


## Design Choices

### Frontend


- **Tailwind CSS** 
- **shadcn/ui** 
- **React Router** 
- **Zod**

### Backend 
- **Prisma**
- **SQLite**
- **Passport JWT**

### Testing

Setup Vitest for both frontend and backend. AI generated unit tests

## Permissions System

Each user can have multiple roles, each role can have multiple permissions. Best for scaling applications.

```
User -> Roles -> Permissions
```


- User permissions are fetched during login and stored in React context
- Protected routes and UI elements have hasPermissions checks on the frontend
- User permissions are fetched from database on each request for security
- JWT tokens stored in localStorage
- Tokens include user ID but not permissions/role
- All permission checks happen on both frontend (UX) and backend (security)

### Permissions
- `can_view_transactions` - View transaction list
- `can_input_transactions` - Create new transactions
- `can_approve_transactions` - Approve pending transactions