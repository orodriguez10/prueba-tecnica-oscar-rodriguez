import { IsIn } from 'class-validator';

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

export class UpdateStatusDto {
  @IsIn(ORDER_STATUSES)
  status: string;
}
