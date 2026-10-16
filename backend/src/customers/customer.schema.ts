import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  // select: false evita que la contraseña salga en las respuestas de la API.
  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  city: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
