import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { buildSearchRegex } from '../common/search-regex';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async findAll({ page, limit, search, category, sort }: ListProductsDto) {
    const filter: FilterQuery<Product> = {};
    if (search) {
      // Ignora mayúsculas y tildes, y trata los símbolos como texto normal.
      filter.name = buildSearchRegex(search);
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
    return { total: await this.productModel.estimatedDocumentCount() };
  }

  async categories() {
    // distinct lo calcula MongoDB; antes se leían todos los productos y se filtraban en memoria.
    const categories = await this.productModel.distinct('category');
    return categories.filter(Boolean).sort();
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.productModel.create(dto);
  }
}
