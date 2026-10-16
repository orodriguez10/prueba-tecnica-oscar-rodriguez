import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

// Rechaza con 400 los ids que no tienen formato de ObjectId, en lugar de dejar que Mongoose falle con un 500.
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string) {
    if (typeof value !== 'string' || !isValidObjectId(value)) {
      throw new BadRequestException('Identificador inválido');
    }
    return value;
  }
}
