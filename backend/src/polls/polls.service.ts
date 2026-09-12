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

  async create(messId: string, actorId: string, dto: CreatePollDto) {
    const poll = await this.prisma.mealPoll.create({
      data: {
        messId,
        date: new Date(dto.date),
        mealType: dto.mealType,
        cutoffTime: new Date(dto.cutoffTime),
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

  async close(messId: string, actorId: string, pollId: string) {
    const poll = await this.prisma.mealPoll.findUnique({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    const updated = await this.prisma.mealPoll.update({ where: { id: pollId }, data: { isOpen: false } });
    await this.audit.log(messId, actorId, 'POLL_CLOSED', `Closed meal poll for ${poll.date.toISOString()}`);
    return updated;
  }
}
