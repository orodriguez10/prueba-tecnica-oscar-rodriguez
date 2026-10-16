import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10000000)
  price: number;

  @IsInt()
  @Min(0)
  @Max(1000000)
  stock: number;
}
