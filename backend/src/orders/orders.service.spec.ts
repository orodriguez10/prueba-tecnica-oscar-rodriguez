import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken('Order'), useValue: {} },
        { provide: getModelToken('Product'), useValue: {} },
        { provide: getModelToken('Customer'), useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(OrdersService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
