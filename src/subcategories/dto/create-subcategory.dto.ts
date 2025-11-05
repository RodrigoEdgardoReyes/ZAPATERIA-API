import { IsString, IsNotEmpty, IsOptional, IsUrl, IsNumber } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsNumber()
  categoryId: number;
}
