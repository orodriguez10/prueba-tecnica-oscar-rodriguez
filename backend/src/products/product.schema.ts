import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop({ required: true })
  price: number;

  // El stock son unidades enteras; el validador evita decimales en cualquier escritura que no pase por el DTO.
  @Prop({
    default: 0,
    min: 0,
    validate: { validator: Number.isInteger, message: 'stock debe ser un entero' },
  })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Índices para los filtros y órdenes de GET /products. Cada orden termina en _id (el desempate
// de la paginación), por eso el índice debe incluirlo para que MongoDB pueda usarlo.
ProductSchema.index({ createdAt: -1, _id: -1 });
ProductSchema.index({ name: 1, _id: 1 });
ProductSchema.index({ price: 1, _id: 1 });
ProductSchema.index({ price: -1, _id: 1 });
ProductSchema.index({ category: 1, createdAt: -1, _id: -1 });
