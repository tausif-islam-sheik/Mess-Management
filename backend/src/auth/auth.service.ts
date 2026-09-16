import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

const toSafeUser = (u: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  messId: string | null;
  depositBalance: number;
}) => ({
  id: u.id,
  name: u.name,
  phone: u.phone,
  email: u.email ?? undefined,
  role: u.role,
  messId: u.messId ?? '',
  depositBalance: u.depositBalance,
});

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private async verifyHash(plain: string, stored: string): Promise<boolean> {
    if (stored.startsWith('$2')) {
      return bcrypt.compare(plain, stored);
    }
    return plain === stored;
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // New password field first, fall back to legacy PIN hash so existing
    // accounts keep working until a password is set for them.
    const stored = user.password ?? user.pin;
    const ok = await this.verifyHash(dto.password, stored);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Upgrade legacy PIN-based credentials to the password field on success.
    if (!user.password) {
      const hash = await bcrypt.hash(dto.password, 10);
      await this.prisma.user.update({ where: { id: user.id }, data: { password: hash } });
    }

    const payload = { sub: user.id, role: user.role, messId: user.messId };
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '7d') as `${number}d`;
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      expiresIn,
    });

    return { accessToken, user: toSafeUser(user) };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return toSafeUser(user);
  }
}
