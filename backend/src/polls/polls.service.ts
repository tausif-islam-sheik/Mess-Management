import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VoteDto } from './dto/vote.dto';

@Injectable()
export class PollsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(messId: string) {
    return this.prisma.mealPoll.findMany({
      where: { messId },
      include: { votes: { include: { user: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByToken(token: string) {
    const poll = await this.prisma.mealPoll.findUnique({
      where: { token },
      include: {
        votes: { include: { user: { select: { id: true, name: true } } } },
        mess: { select: { id: true, name: true } },
      },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    const members = await this.prisma.user.findMany({
      where: { messId: poll.messId },
      select: { id: true, name: true, phone: true },
      orderBy: { createdAt: 'asc' },
    });
    return { ...poll, members };
  }

  /**
   * Resolve the cutoff value to a real Date. Accepts a full date-time string
   * or a time-of-day ("10:00 AM", "10 AM", "22:00") which is combined with
   * the poll date. Plain-text cutoffs like "10:00 AM" are NOT parseable by
   * `new Date()`, so they are handled explicitly.
   */
  private resolveCutoff(date: Date, cutoffTime: string): Date {
    const direct = new Date(cutoffTime);
    if (!Number.isNaN(direct.getTime())) return direct;

    const trimmed = cutoffTime.trim();
    const twelve = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*([aApP])\.?\s*[mM]?\.?$/);
    const twentyFour = trimmed.match(/^(\d{1,2}):(\d{2})$/);

    let hours: number;
    let minutes = 0;
    if (twelve) {
      hours = parseInt(twelve[1], 10) % 12;
      if (twelve[2] !== undefined) minutes = parseInt(twelve[2], 10);
      if (/^[pP]/.test(twelve[3])) hours += 12;
    } else if (twentyFour) {
      hours = parseInt(twentyFour[1], 10);
      minutes = parseInt(twentyFour[2], 10);
    } else {
      throw new BadRequestException('Invalid cutoff time. Use e.g. "10:00 AM" or "22:00".');
    }
    if (hours > 23 || minutes > 59) {
      throw new BadRequestException('Invalid cutoff time. Use e.g. "10:00 AM" or "22:00".');
    }
    const resolved = new Date(date);
    resolved.setHours(hours, minutes, 0, 0);
    return resolved;
  }

  async create(messId: string, actorId: string, dto: CreatePollDto) {
    if (!messId) throw new BadRequestException('No mess selected for this account');
    const date = new Date(dto.date);
    if (Number.isNaN(date.getTime())) throw new BadRequestException('Invalid poll date');
    const poll = await this.prisma.mealPoll.create({
      data: {
        messId,
        date,
        mealType: dto.mealType,
        cutoffTime: this.resolveCutoff(date, dto.cutoffTime),
        isOpen: true,
      },
    });
    await this.audit.log(messId, actorId, 'POLL_CREATED', `Created daily meal poll for ${dto.date} (${dto.mealType})`);
    return poll;
  }

  async vote(pollId: string, dto: VoteDto, actorName?: string) {
    const poll = await this.prisma.mealPoll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (!poll.isOpen) throw new BadRequestException('Poll is closed');

    const existing = await this.prisma.vote.findFirst({
      where: { pollId, userId: dto.userId },
    });

    let vote;
    if (existing) {
      vote = await this.prisma.vote.update({
        where: { id: existing.id },
        data: { lunchCount: dto.lunch, dinnerCount: dto.dinner, guestCount: dto.guest },
      });
    } else {
      vote = await this.prisma.vote.create({
        data: {
          pollId,
          userId: dto.userId,
          lunchCount: dto.lunch,
          dinnerCount: dto.dinner,
          guestCount: dto.guest,
        },
      });
    }

    const voter = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    const name = voter?.name ?? actorName ?? 'Member';
    // Best-effort audit (actor may be an anonymous share-link voter)
    if (voter) {
      await this.audit.log(poll.messId, voter.id, 'MEAL_VOTED', `${name} voted: Lunch=${dto.lunch}, Dinner=${dto.dinner}, Guest=${dto.guest}`);
    }
    return vote;
  }

  async close(messId: string, actorId: string, pollId: string) {    const poll = await this.prisma.mealPoll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    const updated = await this.prisma.mealPoll.update({ where: { id: pollId }, data: { isOpen: false } });
    await this.audit.log(messId, actorId, 'POLL_CLOSED', `Closed meal poll for ${poll.date.toISOString()}`);
    return updated;
  }

  async remove(messId: string, actorId: string, pollId: string) {
    const poll = await this.prisma.mealPoll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    await this.prisma.vote.deleteMany({ where: { pollId } });
    await this.prisma.mealPoll.delete({ where: { id: pollId } });
    await this.audit.log(messId, actorId, 'POLL_REMOVED', `Removed meal poll for ${poll.date.toISOString()}`);
    return { deleted: true };
  }
}
