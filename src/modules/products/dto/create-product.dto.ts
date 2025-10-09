import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
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

export class CreateProductSupplierDto {
  @IsUUID()
  supplierId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code: string;
}

export class CreateProductDto {
  @IsUUID()
  userId: string;

  @ValidateIf((payload: CreateProductDto) => !payload.newBrand)
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductBrandDto)
  newBrand?: CreateProductBrandDto;

  @ValidateIf((payload: CreateProductDto) => !payload.newLine)
  @IsUUID()
  lineId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductLineDto)
  newLine?: CreateProductLineDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSupplierDto)
  @ArrayUnique((item: CreateProductSupplierDto) => item.supplierId)
  @ArrayUnique((item: CreateProductSupplierDto) => item.code.toLowerCase())
  suppliers?: CreateProductSupplierDto[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  @IsNotEmpty()
  category: string;

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
