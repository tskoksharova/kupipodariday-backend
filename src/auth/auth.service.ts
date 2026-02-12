import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

type CreateUserArg = Parameters<UsersService['create']>[0];

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: {
    username: string;
    email: string;
    password: string;
    about?: string;
    avatar?: string;
  }): Promise<User> {
    return this.usersService.create(dto as unknown as CreateUserArg);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findByUsernameWithPassword(username);
    if (!user) {
      throw new UnauthorizedException('Некорректная пара логин и пароль');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Некорректная пара логин и пароль');
    }

    const u = user as unknown as { password?: unknown };
    delete u.password;

    return user;
  }

  async login(user: User): Promise<{ access_token: string }> {
    const u = user as unknown as { id: string; username: string };
    const payload = { sub: u.id, username: u.username };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
