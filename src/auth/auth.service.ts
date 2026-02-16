import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

type CreateUserArg = Parameters<UsersService['create']>[0];

type JwtSignPayload = {
  sub: number;
  username: string;
};

type JwtToken = {
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: CreateUserArg): Promise<User> {
    return this.usersService.create(dto);
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

    const { password: _password, ...safeUser } = user;
    void _password;
    return safeUser as User;
  }

  async login(user: User): Promise<JwtToken> {
    const payload: JwtSignPayload = { sub: user.id, username: user.username };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
