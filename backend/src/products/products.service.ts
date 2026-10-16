import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async findAll(search?: string, category?: string) {
    const filter: any = {};
    if (search) {
      // Se escapan los caracteres especiales para buscar el texto tal cual lo escribió el usuario.
      filter.name = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    let products = await this.productModel.find(filter);

    if (category) {
      products = products.filter((p) => p.category == category);
    }

    // Más nuevos primero
    return products.sort((a: any, b: any) => b.createdAt - a.createdAt);
  }

  async count() {
    const products = await this.productModel.find();
    return { total: products.length };
  }

  async categories() {
    const products = await this.productModel.find();
    const categories = [];
    for (const p of products) {
      if (!categories.includes(p.category)) {
        categories.push(p.category);
      }
    }
    return categories;
  }

  async findOne(id: string) {
    return this.productModel.findById(id);
  }

  async create(dto: CreateProductDto) {
    return this.productModel.create(dto);
  }
}
