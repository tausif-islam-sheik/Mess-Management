import { Injectable, NotFoundException } from '@nestjs/common';
import type { CostCategory } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBazarCostDto } from './dto/create-bazar-cost.dto';
import { CreateUtilityCostDto } from './dto/create-utility-cost.dto';
import { UpdateBazarCostDto } from './dto/update-bazar-cost.dto';
import { UpdateUtilityCostDto } from './dto/update-utility-cost.dto';

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

  async updateBazar(messId: string, actorId: string, id: string, dto: UpdateBazarCostDto) {
    const existing = await this.prisma.bazarCost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Bazar cost not found');
    const data: Record<string, unknown> = {};
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.paidById !== undefined) data.paidById = dto.paidById;
    if (dto.receiptUrl !== undefined) data.receiptUrl = dto.receiptUrl;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    const cost = await this.prisma.bazarCost.update({ where: { id }, data });
    await this.audit.log(messId, actorId, 'BAZAR_COST_UPDATED', `Updated Bazar expense "${cost.description}" (৳${cost.amount})`);
    return cost;
  }

  async removeBazar(messId: string, actorId: string, id: string) {
    const existing = await this.prisma.bazarCost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Bazar cost not found');
    await this.prisma.bazarCost.delete({ where: { id } });
    await this.audit.log(messId, actorId, 'BAZAR_COST_REMOVED', `Removed Bazar expense "${existing.description}" (৳${existing.amount})`);
    return { deleted: true };
  }

  async updateUtility(messId: string, actorId: string, id: string, dto: UpdateUtilityCostDto) {
    const existing = await this.prisma.utilityCost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Utility cost not found');
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.category !== undefined) data.category = dto.category as CostCategory;
    if (dto.paidById !== undefined) data.paidById = dto.paidById;
    if (dto.month !== undefined) data.month = dto.month;
    if (dto.receiptUrl !== undefined) data.receiptUrl = dto.receiptUrl;
    const cost = await this.prisma.utilityCost.update({ where: { id }, data });
    await this.audit.log(messId, actorId, 'UTILITY_COST_UPDATED', `Updated Utility cost "${cost.title}" (৳${cost.amount})`);
    return cost;
  }

  async removeUtility(messId: string, actorId: string, id: string) {
    const existing = await this.prisma.utilityCost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Utility cost not found');
    await this.prisma.utilityCost.delete({ where: { id } });
    await this.audit.log(messId, actorId, 'UTILITY_COST_REMOVED', `Removed Utility cost "${existing.title}" (৳${existing.amount})`);
    return { deleted: true };
  }
}
