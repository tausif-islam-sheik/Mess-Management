import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';

@Injectable()
export class DepositsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(messId: string) {
    return this.prisma.deposit.findMany({
      where: { messId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async add(messId: string, actorId: string, dto: CreateDepositDto) {
    const deposit = await this.prisma.deposit.create({
      data: {
        messId,
        userId: dto.userId,
        amount: dto.amount,
        method: dto.method ?? 'bKash',
        note: dto.note,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
    const member = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    await this.audit.log(
      messId,
      actorId,
      'DEPOSIT_ADDED',
      `Recorded deposit ৳${dto.amount} for ${member?.name ?? 'member'} via ${dto.method ?? 'bKash'}`,
    );
    return deposit;
  }

  async update(messId: string, actorId: string, id: string, dto: UpdateDepositDto) {
    const existing = await this.prisma.deposit.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Deposit not found');
    const data: Record<string, unknown> = {};
    if (dto.userId !== undefined) data.userId = dto.userId;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.method !== undefined) data.method = dto.method;
    if (dto.note !== undefined) data.note = dto.note;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    const deposit = await this.prisma.deposit.update({ where: { id }, data });
    await this.audit.log(messId, actorId, 'DEPOSIT_UPDATED', `Updated deposit ৳${deposit.amount} (${deposit.id})`);
    return deposit;
  }

  async remove(messId: string, actorId: string, id: string) {
    const existing = await this.prisma.deposit.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Deposit not found');
    await this.prisma.deposit.delete({ where: { id } });
    await this.audit.log(messId, actorId, 'DEPOSIT_REMOVED', `Removed deposit ৳${existing.amount} (${existing.id})`);
    return { deleted: true };
  }
}
