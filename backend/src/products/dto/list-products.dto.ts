import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// Máximo de registros por página: evita que alguien pida miles de productos de una vez.
export const MAX_PAGE_SIZE = 100;

export class ListProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsIn(['newest', 'name', 'price_asc', 'price_desc'])
  sort: 'newest' | 'name' | 'price_asc' | 'price_desc' = 'newest';
}
