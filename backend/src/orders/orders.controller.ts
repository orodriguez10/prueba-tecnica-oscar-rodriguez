import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';

@ApiTags('Pedidos')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query() query: ListOrdersDto) {
    return this.ordersService.findAll(query);
  }

  // 'summary' y 'sales-by-month' también deben ir antes de ':id'.
  @Get('summary')
  summary() {
    return this.ordersService.summary();
  }

  @Get('sales-by-month')
  salesByMonth(@Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number) {
    return this.ordersService.salesByMonth(Math.min(Math.max(months, 1), 24));
  }

  // Debe ir antes de ':id'; si no, "top-products" se interpretaría como un id.
  @Get('top-products')
  topProducts(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.ordersService.topProducts(limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
