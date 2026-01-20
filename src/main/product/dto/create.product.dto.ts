import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Apple iPhone 15', description: 'Product name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Latest Apple iPhone model',
    description: 'Product description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/iphone15.jpg',
    description: 'Image URL',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 1299.99, description: 'Product price' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 50, description: 'Available stock' })
  @IsOptional()
  @IsNumber()
  stock?: number;
}
