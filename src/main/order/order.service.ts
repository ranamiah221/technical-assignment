import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from 'generated/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';


@Injectable()
export class OrderService {
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    constructor(private prisma: PrismaService) { }

    async createOrder(userId: string, dto: CreateOrderDto) {
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product || !product.isActive) throw new NotFoundException('Product not found or inactive');

        if (product.stock < dto.quantity) throw new BadRequestException('Not enough stock');

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
        const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { product: true } });
        if (!order) throw new NotFoundException('Order not found');

        if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Order already paid or completed');

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(Number(order.totalAmount) * 100),
            currency: 'usd',
            metadata: { orderId: order.id },
        });

        const payment = await this.prisma.payment.create({
            data: {
                orderId: order.id,
                amount: order.totalAmount,
                providerRefId: paymentIntent.id,
                status: PaymentStatus.INITIATED,
            },
        });

        return paymentIntent;
    }

    async handlePaymentSuccess(paymentIntentId: string) {
        const payment = await this.prisma.payment.findFirst({
            where: { providerRefId: paymentIntentId },
            include: { order: true },
        });

        if (!payment || !payment.order) throw new NotFoundException('Payment or order not found');

        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.SUCCEEDED },
        });

        await this.prisma.order.update({
            where: { id: payment.order.id },
            data: { status: OrderStatus.PAID },
        });

        const product = await this.prisma.product.findUnique({
            where: { id: payment.order.productId },
        });

        if (!product) throw new NotFoundException('Product not found');

        await this.prisma.product.update({
            where: { id: product.id },
            data: { stock: product.stock - 1 },
        });


        return { message: 'Payment successful and stock updated' };
    }
}
