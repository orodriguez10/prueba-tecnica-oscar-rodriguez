import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { ORDER_STATUSES } from './update-status.dto';

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export class ListOrdersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: string;

  // Texto a buscar en el nombre del cliente.
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customer?: string;

  // Fechas en formato YYYY-MM-DD (inclusivas).
  @IsOptional()
  @Matches(DATE_FORMAT, { message: 'from debe tener formato YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(DATE_FORMAT, { message: 'to debe tener formato YYYY-MM-DD' })
  to?: string;
}
