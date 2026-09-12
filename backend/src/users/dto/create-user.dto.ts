import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum RoleDto {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  BAZAR_MANAGER = 'BAZAR_MANAGER',
  MEMBER = 'MEMBER',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

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
