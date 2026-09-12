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

  private async verifyPin(plainPin: string, stored: string): Promise<boolean> {
    if (stored.startsWith('$2')) {
      return bcrypt.compare(plainPin, stored);
    }
    return plainPin === stored;
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await this.verifyPin(dto.pin, user.pin);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Auto-upgrade legacy plain-text PINs to bcrypt hashes
    if (!user.pin.startsWith('$2')) {
      const hash = await bcrypt.hash(dto.pin, 10);
      await this.prisma.user.update({ where: { id: user.id }, data: { pin: hash } });
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
