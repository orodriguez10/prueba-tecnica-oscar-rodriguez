import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async findAll({ page, limit, search, category, sort }: ListProductsDto) {
    const filter: FilterQuery<Product> = {};
    if (search) {
      // Se escapan los caracteres especiales para buscar el texto tal cual lo escribió el usuario.
      filter.name = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    if (category) {
      filter.category = category;
    }

    // _id como desempate: sin él, productos con el mismo valor podrían repetirse o saltarse entre páginas.
    const SORTS: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1, _id: -1 },
      name: { name: 1, _id: 1 },
      price_asc: { price: 1, _id: 1 },
      price_desc: { price: -1, _id: 1 },
    };

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(SORTS[sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
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
