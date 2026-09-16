import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleDto } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  pin?: string;

  @IsOptional()
  @IsEnum(RoleDto)
  role?: RoleDto;
}
