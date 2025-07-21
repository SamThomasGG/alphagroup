import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const viewTransactionsPermission = await prisma.permission.upsert({
    where: { name: 'can_view_transactions' },
    update: {},
    create: {
      name: 'can_view_transactions',
    },
  });

  const inputTransactionsPermission = await prisma.permission.upsert({
    where: { name: 'can_input_transactions' },
    update: {},
    create: {
      name: 'can_input_transactions',
    },
  });

  const approveTransactionsPermission = await prisma.permission.upsert({
    where: { name: 'can_approve_transactions' },
    update: {},
    create: {
      name: 'can_approve_transactions',
    },
  });

  const auditorRole = await prisma.role.upsert({
    where: { name: 'Auditor' },
    update: {},
    create: {
      name: 'Auditor',
      permissions: {
        connect: [{ id: viewTransactionsPermission.id }],
      },
    },
  });

  const inputterRole = await prisma.role.upsert({
    where: { name: 'Inputter' },
    update: {},
    create: {
      name: 'Inputter',
      permissions: {
        connect: [
          { id: viewTransactionsPermission.id },
          { id: inputTransactionsPermission.id },
        ],
      },
    },
  });

  const approverRole = await prisma.role.upsert({
    where: { name: 'Approver' },
    update: {},
    create: {
      name: 'Approver',
      permissions: {
        connect: [
          { id: viewTransactionsPermission.id },
          { id: approveTransactionsPermission.id },
        ],
      },
    },
  });

  const hashedPassword = await bcrypt.hash('password123', 10);

  const auditorUser = await prisma.user.upsert({
    where: { email: 'auditor@example.com' },
    update: {},
    create: {
      email: 'auditor@example.com',
      password: hashedPassword,
      roles: {
        create: {
          roleId: auditorRole.id,
        },
      },
    },
  });

  const inputterUser = await prisma.user.upsert({
    where: { email: 'inputter@example.com' },
    update: {},
    create: {
      email: 'inputter@example.com',
      password: hashedPassword,
      roles: {
        create: {
          roleId: inputterRole.id,
        },
      },
    },
  });

  const approverUser = await prisma.user.upsert({
    where: { email: 'approver@example.com' },
    update: {},
    create: {
      email: 'approver@example.com',
      password: hashedPassword,
      roles: {
        create: {
          roleId: approverRole.id,
        },
      },
    },
  });

  console.log({
    permissions: {
      viewTransactionsPermission,
      inputTransactionsPermission,
      approveTransactionsPermission,
    },
    roles: {
      auditorRole,
      inputterRole,
      approverRole,
    },
    users: {
      auditorUser,
      inputterUser,
      approverUser,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
