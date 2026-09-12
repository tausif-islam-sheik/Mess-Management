import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class VoteDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsInt()
  @Min(0)
  lunch!: number;

  @IsInt()
  @Min(0)
  dinner!: number;

  @IsInt()
  @Min(0)
  guest!: number;
}
