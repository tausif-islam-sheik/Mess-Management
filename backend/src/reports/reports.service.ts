import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { MessService } from '../mess/mess.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private mess: MessService,
    private audit: AuditService,
  ) {}

  list(messId: string) {
    return this.prisma.monthlyReport.findMany({
      where: { messId },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async generate(messId: string, actorId: string, monthYear?: string) {
    const summary = await this.mess.summary(messId);
    const label =
      monthYear ??
      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const existing = await this.prisma.monthlyReport.findFirst({
      where: { messId, monthYear: label },
    });

    const data = {
      messId,
      monthYear: label,
      totalMeals: summary.totalMeals,
      totalBazar: summary.totalBazarCost,
      mealRate: summary.mealRate,
      totalUtility: summary.totalUtilityCost,
    };

    const report = existing
      ? await this.prisma.monthlyReport.update({ where: { id: existing.id }, data })
      : await this.prisma.monthlyReport.create({ data });

    await this.audit.log(messId, actorId, 'REPORT_GENERATED', `Generated monthly report for ${label}`);
    return { ...report, memberSummaries: summary.memberSummaries };
  }
}
