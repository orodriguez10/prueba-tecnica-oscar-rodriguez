import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './order.schema';
import { Product } from '../products/product.schema';
import { Customer } from '../customers/customer.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
  ) {}

  async findAll(status?: string) {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const orders = await this.orderModel.find(filter).sort({ createdAt: -1 });

    const result = [];
    for (const order of orders) {
      const data = order.toObject();
      const customer = await this.customerModel.findById(data.customerId);

      const items = [];
      for (const item of data.items) {
        const product = await this.productModel.findById(item.productId);
        items.push({ ...item, product });
      }

      result.push({ ...data, customer, items });
    }

    return result;
  }

  async findOne(id: string) {
    return this.orderModel.findById(id);
  }

  async create(dto: CreateOrderDto) {
    let total = 0;

    dto.items.forEach(async (item) => {
      const product = await this.productModel.findById(item.productId);

      if (product.stock < item.quantity) {
        throw new BadRequestException(`No hay stock suficiente de ${product.name}`);
      }

      product.stock = product.stock - item.quantity;
      await product.save();

      total += item.unitPrice * item.quantity;
    });

    const order = await this.orderModel.create({
      customerId: dto.customerId,
      items: dto.items,
      total: total,
      status: 'pending',
    });

    return order;
  }

  async updateStatus(id: string, status: string) {
    const order = await this.orderModel.findById(id);
    order.status = status;
    await order.save();
    return order;
  }

  async topProducts(limit: number) {
    const orders = await this.orderModel.find();

    const totals = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId.toString();
        totals[key] = (totals[key] || 0) + item.quantity;
      }
    }

    const ranking = Object.keys(totals)
      .map((productId) => ({ productId, quantity: totals[productId] }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    const result = [];
    for (const r of ranking) {
      const product = await this.productModel.findById(r.productId);
      result.push({ name: product.name, quantity: r.quantity });
    }
    return result;
  }
}
