import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
  HttpException,
  HttpStatus,
  Get,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Admin, User } from '../auth/decorator/admin-user.decorator';
import Stripe from 'stripe';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @User()
  @ApiOperation({ summary: 'User -- > Place an order (PENDING)' })
  createOrder(@GetUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Admin()
  @ApiOperation({ summary: 'Admin: Get all orders' })
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @User()
  @ApiOperation({ summary: 'User: Get my orders' })
  getMyOrders(@GetUser('id') userId: string) {
    return this.orderService.getMyOrders(userId);
  }

  @Post('payment-intent/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @User()
  @ApiOperation({ summary: 'Create Stripe Payment Intent for order' })
  createPayment(@Param('orderId') orderId: string) {
    return this.orderService.createPaymentIntent(orderId);
  }

  @ApiOperation({ summary: 'User can pay and confirm order.' })
  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') sig: string,
  ) {
    console.log('Hit The webhook');
    let event: Stripe.Event;

    try {
      const rawBody = req.rawBody || req.body;
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
      console.log('Stripe Event:', event.type);
      console.log('Stripe Event:', JSON.stringify(event, null, 2));
    } catch (err: any) {
      throw new HttpException(
        `Webhook Error: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await this.orderService.handlePaymentSucceeded(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        await this.orderService.handlePaymentFailed(failedIntent);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return { received: true };
  }

  @Patch(':orderId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @User()
  @ApiOperation({ summary: 'User: Cancel PENDING order' })
  cancelOrder(
    @Param('orderId') orderId: string,
    @GetUser('id') userId: string,
  ) {
    return this.orderService.cancelOrder(orderId, userId);
  }
}
