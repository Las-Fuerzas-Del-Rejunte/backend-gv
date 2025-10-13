import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductBrandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  logo?: string | null;
}

export class CreateProductLineDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;
}

export class CreateProductCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;
}

export class CreateProductDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductBrandDto)
  newBrand?: CreateProductBrandDto;

  @IsOptional()
  @IsUUID()
  lineId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductLineDto)
  newLine?: CreateProductLineDto;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductCategoryDto)
  newCategory?: CreateProductCategoryDto;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsOptional()
  @IsString()
  image?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minStock?: number;
}
