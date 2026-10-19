import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMongoId,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// Máximo de unidades de un mismo producto en un pedido.
export const MAX_ITEM_QUANTITY = 10;

export class CreateOrderItemDto {
  @IsMongoId()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(MAX_ITEM_QUANTITY)
  quantity: number;
}

export class CreateOrderDto {
  @IsMongoId()
  customerId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
