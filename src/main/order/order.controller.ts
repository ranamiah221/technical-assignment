import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from '../auth/decorator/roles';
import { Role } from 'generated/prisma/enums';
import { GetUser } from '../auth/decorator/get-user.decorator';


@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Place an order (PENDING)' })
  createOrder(@GetUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(userId, dto);
  }

  @Post('payment-intent/:orderId')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Create Stripe Payment Intent for order' })
  createPayment(@Param('orderId') orderId: string) {
    return this.orderService.createPaymentIntent(orderId);
  }

  @Post('payment-success/:paymentIntentId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Handle payment success webhook' })
  paymentSuccess(@Param('paymentIntentId') paymentIntentId: string) {
    return this.orderService.handlePaymentSuccess(paymentIntentId);
  }
}
