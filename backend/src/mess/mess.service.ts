import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMessDto } from './dto/update-mess.dto';

@Injectable()
export class MessService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async get(messId: string) {
    const mess = await this.prisma.mess.findUnique({ where: { id: messId } });
    if (!mess) throw new NotFoundException('Mess not found');
    return mess;
  }

  async list() {
    return this.prisma.mess.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async update(messId: string, actorId: string, dto: UpdateMessDto) {
    const existing = await this.prisma.mess.findUnique({ where: { id: messId } });
    if (!existing) throw new NotFoundException('Mess not found');
    const data: Record<string, string> = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.currency !== undefined) data.currency = dto.currency.trim();
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl.trim();
    const updated = await this.prisma.mess.update({ where: { id: messId }, data });
    await this.audit.log(messId, actorId, 'MESS_UPDATED', `Updated mess settings (name: "${updated.name}")`);
    return updated;
  }

  /** Server-side dashboard rollup — same formula as the client demo mode. */
  async summary(messId: string) {
    const [users, polls, bazarCosts, utilityCosts, deposits] = await Promise.all([
      this.prisma.user.findMany({ where: { messId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.mealPoll.findMany({ where: { messId }, include: { votes: true } }),
      this.prisma.bazarCost.findMany({ where: { messId } }),
      this.prisma.utilityCost.findMany({ where: { messId } }),
      this.prisma.deposit.findMany({ where: { messId } }),
    ]);

    const mealsByUser: Record<string, { lunch: number; dinner: number; guest: number; total: number }> = {};
    users.forEach((u) => {
      mealsByUser[u.id] = { lunch: 0, dinner: 0, guest: 0, total: 0 };
    });
    polls.forEach((poll) => {
      poll.votes.forEach((vote) => {
        if (!mealsByUser[vote.userId]) mealsByUser[vote.userId] = { lunch: 0, dinner: 0, guest: 0, total: 0 };
        const s = mealsByUser[vote.userId];
        s.lunch += vote.lunchCount;
        s.dinner += vote.dinnerCount;
        s.guest += vote.guestCount;
        s.total += vote.lunchCount + vote.dinnerCount + vote.guestCount;
      });
    });

    const totalBazarCost = bazarCosts.reduce((a, c) => a + c.amount, 0);
    const totalUtilityCost = utilityCosts.reduce((a, c) => a + c.amount, 0);
    const totalMeals = Object.values(mealsByUser).reduce((a, s) => a + s.total, 0);
    const mealRate = totalMeals > 0 ? totalBazarCost / totalMeals : 0;
    const utilityPerMember = users.length > 0 ? totalUtilityCost / users.length : 0;

    const memberSummaries = users.map((user) => {
      const s = mealsByUser[user.id] ?? { lunch: 0, dinner: 0, guest: 0, total: 0 };
      const bazarCostShare = s.total * mealRate;
      const utilityShare = utilityPerMember;
      const totalCost = bazarCostShare + utilityShare;
      const totalDeposited = deposits
        .filter((d) => d.userId === user.id)
        .reduce((a, d) => a + d.amount, 0);
      return {
        user,
        totalMeals: s.total,
        lunchMeals: s.lunch,
        dinnerMeals: s.dinner,
        guestMeals: s.guest,
        bazarCostShare,
        utilityShare,
        totalCost,
        totalDeposited,
        netBalance: totalDeposited - totalCost,
      };
    });

    return {
      totalBazarCost,
      totalUtilityCost,
      totalMeals,
      mealRate,
      utilityPerMember,
      memberSummaries,
    };
  }
}
