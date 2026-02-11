import { User } from '../entities/user.entity';

export class UserProfileResponseDto {
  id: number;
  username: string;
  about: string;
  avatar: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: User): UserProfileResponseDto {
    return {
      id: user.id,
      username: user.username,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
