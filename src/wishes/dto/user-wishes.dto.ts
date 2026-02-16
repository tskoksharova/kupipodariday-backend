import { User } from '../../users/entities/user.entity';
import { WishPartialDto } from './wish-partial.dto';

export class UserWishesDto {
  id: number;
  username: string;
  about: string;
  avatar: string;
  email: string;
  wishes: WishPartialDto[];

  static fromEntity(user: User): UserWishesDto {
    return {
      id: user.id,
      username: user.username,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
      wishes: Array.isArray(user.wishes)
        ? user.wishes.map(WishPartialDto.fromEntity)
        : [],
    };
  }
}
