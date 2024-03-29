import {
  Body,
  Controller,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserProfileDto } from './dto/userProfile.dto';
import { ReqUser, ReqUserType } from 'src/auth/util/user.decorator';
import { AuthUserDto } from './dto/authUser.dto';
import { FollowDto } from './dto/follow.dto';

@ApiTags('users')
@Controller('user')
export class UsersController {
  logger: Logger;

  constructor(private readonly usersService: UsersService) {
    this.logger = new Logger();
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('profile/:id')
  async getProfileAndFinds(@Param('id') id: string): Promise<UserProfileDto> {
    return this.usersService.getProfileAndFinds(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('username/:username')
  async updateUsername(
    @Param('username') username: string,
    @ReqUser() user: ReqUserType,
  ): Promise<AuthUserDto> {
    return this.usersService.updateUsername(username, user.userId.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('firstname/:firstname')
  async updateFirstname(
    @Param('firstname') firstname: string,
    @ReqUser() user: ReqUserType,
  ): Promise<AuthUserDto> {
    return this.usersService.updateFirstname(firstname, user.userId.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('user')
  async getUser(@ReqUser() user: ReqUserType): Promise<AuthUserDto> {
    return this.usersService.getUser(user.userId.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('follow/:id')
  async followUser(
    @Param('id') id: string,
    @ReqUser() user: ReqUserType,
  ): Promise<FollowDto> {
    return this.usersService.followUser(id, user.userId.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('follow-status/:id')
  async getFollowStatus(
    @Param('id') id: string,
    @ReqUser() user: ReqUserType,
  ): Promise<boolean> {
    return this.usersService.getFollowStatus(id, user.userId.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('update-user-avatar')
  async updateUserAvatar(
    @Body() { avatar }: { avatar: string },
    @ReqUser() user: ReqUserType,
  ) {
    return this.usersService.updateUserAvatar(avatar, user.userId.id);
  }
}
