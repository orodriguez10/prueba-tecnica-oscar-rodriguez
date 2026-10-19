import { IsIn } from 'class-validator';

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

// Estados a los que se puede pasar desde cada uno. "shipped" y "cancelled" son finales.
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: [],
  cancelled: [],
};

export class UpdateStatusDto {
  @IsIn(ORDER_STATUSES)
  status: string;
}
