import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['pending', 'paid', 'shipped', 'cancelled'])
  status: string;
}
