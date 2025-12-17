import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { Order, OrderStatus } from '../models';
import { emailQueue } from '../jobs/email.queue';

export const handlePaystackWebhook = async (req: Request, res: Response) => {
    // Validate event
    const hash = req.headers['x-paystack-signature'] as string;
    
    // In app.ts we stored rawBody for this route
    const rawBody = (req as any).rawBody; 
    // If rawBody is not available (e.g. if config failed), we might fail verification or try JSON.stringify(req.body) 
    // but JSON.stringify is unreliable due to key ordering.
    // Assuming app.ts config works.
    
    if (!rawBody) {
        console.error('Raw body missing for Paystack webhook');
        return res.status(400).send('Raw body missing');
    }

    // Verify signature
    if (!PaymentService.verifyWebhookSignature(hash, rawBody)) {
        return res.status(400).send('Invalid signature');
    }

    // Retrieve the request's body
    const event = req.body; // express.json() should have parsed it too if we allowed it, or we parse rawBody
    // If we used express.raw(), req.body might be buffer. 
    // In app.ts we used express.json({ verify: ... save rawBody ... }) which means req.body IS parsed JSON.
    // So event is req.body.

    switch (event.event) {
        case 'charge.success':
            const data = event.data;
            const reference = data.reference;
            const metadata = data.metadata;
            
            // Find order by reference or metadata
            let order;
            if (metadata && metadata.orderId) {
                order = await Order.findByPk(metadata.orderId);
            } else {
                order = await Order.findOne({ where: { paymentReference: reference } });
            }

            if (order) {
                if (order.totalAmount <= (data.amount / 100)) {
                     // Check if amount paid matches (Paystack amount is in kobo)
                     await order.update({ status: OrderStatus.PAID });
                     console.log(`Order ${order.id} marked as PAID`);
                     
                     // Send Confirmation Email
                     if (data.customer && data.customer.email) {
                         await emailQueue.add('order-confirmation', {
                             type: 'generic',
                             data: {
                                 to: data.customer.email,
                                 subject: `Order Confirmation #${order.id}`,
                                 text: `Thank you for your order! Your payment of ${order.totalAmount} was successful.`,
                                 html: `<h1>Order Confirmed</h1><p>Order ID: ${order.id}</p><p>Total Paid: ${order.totalAmount}</p>`
                             }
                         });
                     }

                } else {
                    console.warn(`Order ${order.id} payment mismatch: paid ${data.amount/100}, expected ${order.totalAmount}`);
                }
            } else {
                console.warn(`Order not found for reference: ${reference}`);
            }
            break;
        
        default:
            console.log(`Unhandled event type ${event.event}`);
    }

    res.sendStatus(200);
};