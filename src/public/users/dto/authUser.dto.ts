import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Dto } from 'src/lib/dto/Dto';

export class AuthUserDto extends Dto<AuthUserDto> {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  avatar?: string;
}
