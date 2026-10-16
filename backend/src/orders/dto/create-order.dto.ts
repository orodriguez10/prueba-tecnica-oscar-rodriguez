import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsMongoId, IsNumber, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class CreateOrderDto {
  @IsMongoId()
  customerId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
