import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';

@ApiTags('Clientes')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get('by-email')
  findByEmail(@Query('email') email: string) {
    return this.customersService.findByEmail(email);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.customersService.findOne(id);
  }
}
