import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UserProfileDto } from './dto/userProfile.dto';
import { AuthUserDto } from './dto/authUser.dto';
import { FollowDto } from './dto/follow.dto';
import { ProfileDto } from './dto/profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getFollowStatus(userId: string, followerId: string) {
    const existingRecord = await this.prisma.follower.findFirst({
      where: {
        followerId: followerId,
        followingId: userId,
      },
    });

    if (existingRecord) {
      if (existingRecord.deleted_at) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  async followUser(userId: string, followerId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const follower = await this.prisma.user.findUnique({
      where: {
        id: followerId,
      },
    });

    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    const existingRecord = await this.prisma.follower.findFirst({
      where: {
        followerId: followerId,
        followingId: userId,
      },
    });

    if (existingRecord) {
      if (existingRecord.deleted_at) {
        const res = await this.prisma.follower.update({
          where: {
            id: existingRecord.id,
          },
          data: {
            deleted_at: null,
          },
        });

        return new FollowDto({
          id: res.id,
          followerId: res.followerId,
          followingId: res.followingId,
          created_at: res.created_at,
          deleted_at: res.deleted_at,
          updated_at: res.updated_at,
        });
      } else {
        const res = await this.prisma.follower.update({
          where: {
            id: existingRecord.id,
          },
          data: {
            deleted_at: new Date(),
          },
        });

        return new FollowDto({
          id: res.id,
          followerId: res.followerId,
          followingId: res.followingId,
          created_at: res.created_at,
          deleted_at: res.deleted_at,
          updated_at: res.updated_at,
        });
      }
    } else {
      const res = await this.prisma.follower.create({
        data: {
          followingId: userId,
          followerId: followerId,
        },
      });

      return new FollowDto({
        id: res.id,
        followerId: res.followerId,
        followingId: res.followingId,
        created_at: res.created_at,
        deleted_at: res.deleted_at,
        updated_at: res.updated_at,
      });
    }
  }

  async getUser(userId: string) {
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new AuthUserDto({
      email: user.email,
      firstname: user.firstname,
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    });
  }

  async findOneWithEmail(username: string) {
    return await this.prisma.user.findUnique({
      where: {
        email: username,
      },
    });
  }

  async create(data: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: data.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    return await this.prisma.user.create({
      data: {
        email: data.email,
      },
    });
  }

  async getProfileAndFinds(userId: string) {
    const profile = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        followers: true,
        following: true,
        finds: {
          include: {
            place: true,
            category: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!profile) {
      return null;
    }

    return new UserProfileDto({
      id: profile.id,
      username: profile.username,
      avatar: profile.avatar,
      firstname: profile.firstname,
      followers: profile.followers.length,
      following: profile.following.length,
      bio: profile.bio,
      finds: profile.finds.map((find) => ({
        id: find.id,
        createdAt: find.created_at,
        images: find.images,
        tags: find.tags,
        place: {
          id: find.place.id,
          name: find.place.name,
          address: find.place.address,
          googleMapsUri: find.place.google_maps_uri,
          googlePlaceId: find.place.google_place_id,
        },
        category: {
          id: find.category.id,
          name: find.category.name,
        },
        review: find.review,
        user: {
          firstname: profile.firstname,
          id: profile.id,
          username: profile.username,
          avatar: profile.avatar,
        },
      })),
    });
  }

  async updateUsername(username: string, userId: string) {
    if (username.length < 3) {
      throw new ConflictException('Username must be at least 3 characters');
    }

    if (username.length > 15) {
      throw new ConflictException('Username must be at most 15 characters');
    }

    if (!/^[a-zA-Z0-9_.-]*$/.test(username)) {
      throw new ConflictException(
        'Username can only contain letters, numbers, underscores, dashes and dots',
      );
    }

    const usernameTaken = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!!usernameTaken) {
      throw new ConflictException('Username already taken');
    }

    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
      },
    });

    return new AuthUserDto({
      email: user.email,
      firstname: user.firstname,
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    });
  }

  async updateFirstname(firstname: string, userId: string) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstname,
      },
    });

    return new AuthUserDto({
      email: user.email,
      firstname: user.firstname,
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    });
  }

  async updateUserAvatar(avatar: string, userId: string) {
    const res = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar,
      },
    });

    return new ProfileDto({
      id: res.id,
      firstname: res.firstname,
      username: res.username,
      avatar: res.avatar,
    });
  }
}
