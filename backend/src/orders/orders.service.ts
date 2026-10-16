import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Order } from './order.schema';
import { Product } from '../products/product.schema';
import { Customer } from '../customers/customer.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { buildSearchRegex } from '../common/search-regex';
import { ListOrdersDto } from './dto/list-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
  ) {}

  async findAll({ page, limit, status, customer, from, to }: ListOrdersDto) {
    const filter: FilterQuery<Order> = {};
    if (status) {
      filter.status = status;
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(`${from}T00:00:00`);
      if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59.999`);
    }
    if (customer) {
      const regex = buildSearchRegex(customer);
      const matches = await this.customerModel
        .find({ name: regex }, { _id: 1 })
        .lean();
      filter.customerId = { $in: matches.map((c) => c._id) };
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    const customerIds = [...new Set(orders.map((o) => o.customerId.toString()))];
    const productIds = [
      ...new Set(orders.flatMap((o) => o.items.map((i) => i.productId.toString()))),
    ];

    const [customers, products] = await Promise.all([
      this.customerModel.find({ _id: { $in: customerIds } }).lean(),
      this.productModel.find({ _id: { $in: productIds } }).lean(),
    ]);
    const customerById = new Map(customers.map((c) => [c._id.toString(), c]));
    const productById = new Map(products.map((p) => [p._id.toString(), p]));

    const data = orders.map((order) => ({
      ...order,
      customer: customerById.get(order.customerId.toString()),
      items: order.items.map((item) => ({
        ...item,
        product: productById.get(item.productId.toString()),
      })),
    }));

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async create(dto: CreateOrderDto) {
    const ids = dto.items.map((i) => i.productId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Hay productos repetidos en el pedido');
    }
    if (!(await this.customerModel.exists({ _id: dto.customerId }))) {
      throw new NotFoundException('El cliente no existe');
    }

    const reserved: { productId: string; quantity: number }[] = [];
    const items = [];
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
        // El precio sale de la base de datos, no del que envíe el cliente.
        items.push({ productId: product._id, quantity: item.quantity, unitPrice: product.price });
        total += product.price * item.quantity;
      }

      return await this.orderModel.create({
        customerId: dto.customerId,
        items,
        // Se redondea a 2 decimales: 0.2 * 3 en coma flotante da 0.6000000000000001.
        total: Math.round(total * 100) / 100,
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
    if (!order) throw new NotFoundException('Pedido no encontrado');
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
