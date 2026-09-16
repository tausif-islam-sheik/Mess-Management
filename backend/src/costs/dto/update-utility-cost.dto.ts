import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CostCategoryDto } from './create-utility-cost.dto';

export class UpdateUtilityCostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(CostCategoryDto)
  category?: CostCategoryDto;

  @IsOptional()
  @IsString()
  paidById?: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
