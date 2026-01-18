import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/main/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/main/auth/guards/roles.guard';
import { Admin, User } from '@/main/auth/decorator/admin-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { handleRequest } from '@/common/helpers/handle.request';
import { UpdateProductDto } from './dto/update.product.dto';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create.product.dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ----- ADMIN ONLY -----
  @Post()
  @Admin()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() dto: CreateProductDto) {
    return handleRequest(
      () => this.productService.create(dto),
      'Product created successfully',
    );
  }

  @Patch(':id')
  @Admin()
  @ApiOperation({ summary: 'Update a product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return handleRequest(
      () => this.productService.update(id, dto),
      'Product updated successfully',
    );
  }

  @Delete(':id')
  @Admin()
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id') id: string) {
    return handleRequest(
      () => this.productService.remove(id),
      'Product deleted successfully',
    );
  }

  // ----- USER & ADMIN -----
  @Get()
  @User()
  @ApiOperation({ summary: 'Get all products' })
  findAll() {
    return handleRequest(
      () => this.productService.findAll(),
      'Products fetched successfully',
    );
  }

  @Get(':id')
  @User()
  @ApiOperation({ summary: 'Get product details by ID' })
  findOne(@Param('id') id: string) {
    return handleRequest(
      () => this.productService.findOne(id),
      'Product details fetched successfully',
    );
  }
}
