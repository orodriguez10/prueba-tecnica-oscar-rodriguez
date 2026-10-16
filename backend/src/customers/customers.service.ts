import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.schema';

@Injectable()
export class CustomersService {
  constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>) {}

  async findAll() {
    return this.customerModel.find();
  }

  async findByEmail(email: string) {
    return this.customerModel.find({ email: email });
  }

  async findOne(id: string) {
    return this.customerModel.findById(id);
  }
}
