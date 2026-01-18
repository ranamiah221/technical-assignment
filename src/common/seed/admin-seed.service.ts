import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@system.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const adminExists = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (adminExists) {
      this.logger.log('✅ Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await this.prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        verified: true,
        IsActive: true,
        firstName: 'System',
        lastName: 'Admin',
      },
    });

    this.logger.warn('🚀 Admin user auto-seeded');
  }
}
