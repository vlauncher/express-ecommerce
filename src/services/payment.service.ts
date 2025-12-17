import axios from 'axios';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export class PaymentService {
    static async initializeTransaction(email: string, amount: number, metadata: any = {}, callbackUrl?: string) {
        // Amount is in kobo (NGN * 100) or cents
        const params: any = {
            email,
            amount: Math.round(amount * 100),
            metadata,
        };

        if (callbackUrl) {
            params.callback_url = callbackUrl;
        }

        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            params,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.data; // { authorization_url, access_code, reference }
    }

    static async verifyTransaction(reference: string) {
        const response = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        return response.data.data;
    }

    static verifyWebhookSignature(signature: string, body: any): boolean {
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(body))
            .digest('hex');

        return hash === signature;
    }
}