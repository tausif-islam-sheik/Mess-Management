import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum CostCategoryDto {
  BAZAR = 'BAZAR',
  UTILITY = 'UTILITY',
  REPAIR = 'REPAIR',
  OTHER = 'OTHER',
}

export class CreateUtilityCostDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(CostCategoryDto)
  category!: CostCategoryDto;

  @IsString()
  @IsNotEmpty()
  paidById!: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
