import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from 'generated/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class OrderService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product || !product.isActive)
      throw new NotFoundException('Product not found or inactive');

    if (product.stock < dto.quantity)
      throw new BadRequestException('Not enough stock');

    const totalAmount = Number(product.price) * dto.quantity;

    const order = await this.prisma.order.create({
      data: {
        userId,
        productId: product.id,
        totalAmount,
        status: OrderStatus.PENDING,
      },
    });

    return order;
  }

  async createPaymentIntent(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order already processed');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: 'usd',
      metadata: {
        orderId: order.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await this.prisma.payment.upsert({
      where: {
        orderId: order.id,
      },
      update: {
        providerRefId: paymentIntent.id,
        status: 'PROCESSING',
      },
      create: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'usd',
        providerRefId: paymentIntent.id,
        status: 'INITIATED',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.error('orderId missing in metadata');
      return;
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error('Order not found for success webhook');
      return;
    }

    if (order.status === 'PAID') return;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
      },
    });

    console.log(` Order ${orderId} marked as PAID`);
  }
  async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.error('orderId missing in metadata');
      return;
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error('Order not found for failed webhook');
      return;
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'FAILED',
      },
    });

    console.log(` Order ${orderId} marked as FAILED`);
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
      },
    });
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You cannot cancel this order');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING orders can be cancelled');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
      },
    });
  }
}
