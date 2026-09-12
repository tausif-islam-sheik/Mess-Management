import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleDto } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  pin?: string;

  @IsOptional()
  @IsEnum(RoleDto)
  role?: RoleDto;
}
