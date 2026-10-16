import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    const reserved: { productId: string; quantity: number }[] = [];
    let total = 0;

    try {
      for (const item of dto.items) {
        // Descuenta el stock solo si alcanza, en una única operación atómica.
        const product = await this.productModel.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        );

        if (!product) {
          const existing = await this.productModel.findById(item.productId, 'name');
          if (!existing) {
            throw new NotFoundException('El producto no existe');
          }
          throw new BadRequestException(`No hay stock suficiente de ${existing.name}`);
        }

        reserved.push({ productId: item.productId, quantity: item.quantity });
        total += item.unitPrice * item.quantity;
      }

      return await this.orderModel.create({
        customerId: dto.customerId,
        items: dto.items,
        total: total,
        status: 'pending',
      });
    } catch (error) {
      // Si el pedido falla, se devuelve el stock de los productos ya descontados.
      await Promise.all(
        reserved.map((r) =>
          this.productModel.updateOne({ _id: r.productId }, { $inc: { stock: r.quantity } }),
        ),
      );
      throw error;
    }
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
