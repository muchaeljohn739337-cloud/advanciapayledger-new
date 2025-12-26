const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin exists
    const existing = await prisma.users.findUnique({
      where: { email: 'admin@advancia.com' }
    });

    if (existing) {
      console.log('Admin user already exists:', { id: existing.id, email: existing.email, role: existing.role });
      await prisma.$disconnect();
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 12);
    const admin = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email: 'admin@advancia.com',
        username: 'admin',
        passwordHash: passwordHash,
        role: 'ADMIN',
        active: true,
        approvedByAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('Admin user created successfully!');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

createAdminUser();
