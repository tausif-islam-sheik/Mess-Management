import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMessDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  currency?: string;
}
