
import { createClient } from '@/lib/supabase/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'key_secret',
});

export const BillingService = {
    async createOrder(amount: number, receiptId: string) {
        const options = {
            amount: amount * 100, // amount in paisa
            currency: "INR",
            receipt: receiptId,
        };
        try {
            const order = await razorpay.orders.create(options);
            return order;
        } catch (error) {
            throw error;
        }
    },

    verifySignature(body: string, signature: string, secret: string) {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        return expectedSignature === signature;
    },

    async recordTransaction(hospitalId: string, paymentDetails: any) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('payment_transactions')
            .insert({
                hospital_id: hospitalId,
                razorpay_payment_id: paymentDetails.razorpay_payment_id,
                razorpay_order_id: paymentDetails.razorpay_order_id,
                amount: paymentDetails.amount,
                status: 'success'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async activateSubscription(hospitalId: string, planId: string, durationDays: number) {
        const supabase = createClient();

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + durationDays);

        // Deactivate old subscriptions? Maybe. For now just insert new active one.
        const { data, error } = await supabase
            .from('hospital_subscriptions')
            .insert({
                hospital_id: hospitalId,
                plan_id: planId,
                status: 'active',
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
