import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(email: string, password: string, role: 'ADMIN' | 'MASTER' = 'MASTER', staffId?: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email уже зарегистрирован');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hash, role, staffId },
    });
    return this.sign(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { staff: true },
    });
    if (!user) throw new UnauthorizedException('Неверный email или пароль');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Неверный email или пароль');
    return this.sign(user);
  }

  private sign(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, staffId: user.staffId };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, role: user.role, staffId: user.staffId },
    };
  }
}
