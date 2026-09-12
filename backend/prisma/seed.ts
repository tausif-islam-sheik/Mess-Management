import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mess database...');

  // Clean existing data (respect FK order)
  await prisma.auditLog.deleteMany({});
  await prisma.bazarRoster.deleteMany({});
  await prisma.monthlyReport.deleteMany({});
  await prisma.deposit.deleteMany({});
  await prisma.utilityCost.deleteMany({});
  await prisma.bazarCost.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.mealPoll.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.mess.deleteMany({});

  // Default mess (mirrors the frontend demo state id)
  const mess = await prisma.mess.create({
    data: {
      id: 'mess_default',
      name: 'New Shared Mess Group',
      currency: 'BDT',
      managerId: 'user_super_admin',
    },
  });

  // Super Admin (PIN 9999, stored as bcrypt hash)
  const superAdmin = await prisma.user.create({
    data: {
      id: 'user_super_admin',
      name: 'System Super Admin',
      phone: '+8801999999999',
      email: 'admin@messmanager.com',
      pin: await bcrypt.hash('9999', 10),
      role: Role.SUPER_ADMIN,
      messId: mess.id,
      depositBalance: 0,
    },
  });

  await prisma.auditLog.create({
    data: {
      messId: mess.id,
      actorId: superAdmin.id,
      action: 'SYSTEM_INITIALIZED',
      details: 'System initialized with Super Admin account.',
    },
  });

  console.log('Seed complete:');
  console.log(`- Mess: ${mess.name} (${mess.id})`);
  console.log(`- Super Admin: admin@messmanager.com / +8801999999999 (PIN 9999)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
