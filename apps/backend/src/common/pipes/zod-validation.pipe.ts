import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error.errors) {
        const messages = error.errors.map((err: any) => {
          return `${err.path.join('.')}: ${err.message}`;
        });
        throw new BadRequestException(
          `Validation failed: ${messages.join(', ')}`,
        );
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
