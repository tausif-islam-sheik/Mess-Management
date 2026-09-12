import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(messId: string, actorId: string, action: string, details: string) {
    if (!messId || !actorId) return Promise.resolve(null);
    return this.prisma.auditLog
      .create({ data: { messId, actorId, action, details } })
      .catch(() => null);
  }

  list(messId: string, take = 100) {
    return this.prisma.auditLog.findMany({
      where: { messId },
      include: { actor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
