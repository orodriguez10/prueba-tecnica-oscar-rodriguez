import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
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
import { ORDER_STATUSES, UpdateStatusDto } from './dto/update-status.dto';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';

@ApiTags('Pedidos')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    // Solo se aceptan estados válidos (evita también consultas tipo ?status[$ne]=x).
    if (status && !ORDER_STATUSES.includes(status)) {
      throw new BadRequestException('Estado inválido');
    }
    return this.ordersService.findAll(status);
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
