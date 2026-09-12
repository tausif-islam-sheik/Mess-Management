import { Injectable, NotFoundException } from '@nestjs/common';
import type { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(messId: string | null) {
    return this.prisma.user.findMany({
      where: messId ? { OR: [{ messId }, { role: 'SUPER_ADMIN' }] } : undefined,
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(messId: string, actorId: string, dto: CreateUserDto) {
    const pin = dto.pin?.trim() ? dto.pin : '1234';
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        pin: await bcrypt.hash(pin, 10),
        role: (dto.role ?? 'MEMBER') as Role,
        messId,
      },
    });
    await this.audit.log(messId, actorId, 'MEMBER_ADDED', `Enrolled ${user.name} (${user.phone})`);
    return user;
  }

  async update(messId: string, actorId: string, id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.pin?.trim()) data.pin = await bcrypt.hash(dto.pin, 10);
    const user = await this.prisma.user.update({ where: { id }, data });
    await this.audit.log(messId, actorId, 'MEMBER_UPDATED', `Updated member ${user.name}`);
    return user;
  }

  async remove(messId: string, actorId: string, id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    await this.audit.log(messId, actorId, 'MEMBER_REMOVED', `Removed member ${existing.name}`);
    return { deleted: true };
  }
}
