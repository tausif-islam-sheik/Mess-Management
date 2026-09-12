import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier!: string; // phone number or email

  @IsString()
  @IsNotEmpty()
  pin!: string;
}
