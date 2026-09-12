import { Injectable } from '@nestjs/common';
import type { CostCategory } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBazarCostDto } from './dto/create-bazar-cost.dto';
import { CreateUtilityCostDto } from './dto/create-utility-cost.dto';

@Injectable()
export class CostsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  listBazar(messId: string) {
    return this.prisma.bazarCost.findMany({
      where: { messId },
      include: { paidBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  listUtility(messId: string) {
    return this.prisma.utilityCost.findMany({
      where: { messId },
      include: { paidBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addBazar(messId: string, actorId: string, dto: CreateBazarCostDto) {
    const cost = await this.prisma.bazarCost.create({
      data: {
        messId,
        date: dto.date ? new Date(dto.date) : new Date(),
        amount: dto.amount,
        description: dto.description,
        paidById: dto.paidById,
        receiptUrl: dto.receiptUrl,
      },
    });
    await this.audit.log(messId, actorId, 'BAZAR_COST_ADDED', `Logged Bazar expense ৳${dto.amount} for "${dto.description}"`);
    return cost;
  }

  async addUtility(messId: string, actorId: string, dto: CreateUtilityCostDto) {
    const month =
      dto.month ??
      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const cost = await this.prisma.utilityCost.create({
      data: {
        messId,
        month,
        category: dto.category as CostCategory,
        title: dto.title,
        amount: dto.amount,
        paidById: dto.paidById,
        receiptUrl: dto.receiptUrl,
      },
    });
    await this.audit.log(messId, actorId, 'UTILITY_COST_ADDED', `Logged Utility cost ৳${dto.amount} for "${dto.title}"`);
    return cost;
  }
}
