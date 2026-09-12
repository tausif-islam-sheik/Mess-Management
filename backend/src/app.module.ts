import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessModule } from './mess/mess.module';
import { PollsModule } from './polls/polls.module';
import { CostsModule } from './costs/costs.module';
import { DepositsModule } from './deposits/deposits.module';
import { RosterModule } from './roster/roster.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MessModule,
    PollsModule,
    CostsModule,
    DepositsModule,
    RosterModule,
    ReportsModule,
    AuditModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
