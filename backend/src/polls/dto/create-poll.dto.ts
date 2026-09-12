import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum MealTypeDto {
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  BOTH = 'BOTH',
}

export class CreatePollDto {
  @IsDateString()
  date!: string;

  @IsEnum(MealTypeDto)
  mealType!: MealTypeDto;

  @IsString()
  @IsNotEmpty()
  cutoffTime!: string;
}
