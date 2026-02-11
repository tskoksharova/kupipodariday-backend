import { User } from '../entities/user.entity';

export class UserPublicProfileResponseDto {
  id: number;
  username: string;
  about: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: User): UserPublicProfileResponseDto {
    return {
      id: user.id,
      username: user.username,
      about: user.about,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
