import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateSaleItemDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitPrice: number;
}

export class UpdateSaleDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalAmount?: number;

  @IsOptional()
  @IsDateString()
  saleDate?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateSaleItemDto)
  items?: UpdateSaleItemDto[];
}
