import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRosterDto } from './dto/create-roster.dto';
import { UpdateRosterDto } from './dto/update-roster.dto';

@Injectable()
export class RosterService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(messId: string) {
    return this.prisma.bazarRoster.findMany({
      where: { messId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { startDate: 'asc' },
    });
  }

  async assign(messId: string, actorId: string, dto: CreateRosterDto) {
    const entry = await this.prisma.bazarRoster.create({
      data: {
        messId,
        userId: dto.userId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? 'PENDING',
      },
    });
    const member = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    await this.audit.log(
      messId,
      actorId,
      'ROSTER_ASSIGNED',
      `Assigned Bazar duty to ${member?.name ?? 'member'} (${dto.startDate} to ${dto.endDate})`,
    );
    return entry;
  }

  async setStatus(messId: string, actorId: string, id: string, status: string) {
    const existing = await this.prisma.bazarRoster.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Roster entry not found');
    const updated = await this.prisma.bazarRoster.update({ where: { id }, data: { status } });
    await this.audit.log(messId, actorId, 'ROSTER_STATUS', `Marked Bazar duty ${id} as ${status}`);
    return updated;
  }

  async update(messId: string, actorId: string, id: string, dto: UpdateRosterDto) {
    const existing = await this.prisma.bazarRoster.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Roster entry not found');
    const data: Record<string, unknown> = {};
    if (dto.userId !== undefined) data.userId = dto.userId;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.status !== undefined) data.status = dto.status;
    const updated = await this.prisma.bazarRoster.update({ where: { id }, data });
    await this.audit.log(messId, actorId, 'ROSTER_UPDATED', `Updated Bazar duty ${id}`);
    return updated;
  }

  async remove(messId: string, actorId: string, id: string) {
    const existing = await this.prisma.bazarRoster.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Roster entry not found');
    await this.prisma.bazarRoster.delete({ where: { id } });
    await this.audit.log(messId, actorId, 'ROSTER_REMOVED', `Removed Bazar duty ${id}`);
    return { deleted: true };
  }
}
