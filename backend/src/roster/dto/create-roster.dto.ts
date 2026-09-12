import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRosterDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
