import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';

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
}
