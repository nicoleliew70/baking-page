import { NextResponse } from 'next/server';
import { getCalendarAvailability } from '@/lib/googleCalendar';
import Stripe from 'stripe';
import { WORKSHOP_CONFIG, SlotId } from '@/lib/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, name, email, getNotified, slot } = body;

    // 1. Validation
    if (!date || !name || !email || !slot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dateStr = date.split('T')[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 2. 🛡️ Logic Guard: Server-side capacity check
    const checkDate = new Date(dateStr);
    const availability = await getCalendarAvailability(checkDate, checkDate);
    const dayAvailability = availability[dateStr] || {};
    const currentCount = dayAvailability[slot.toUpperCase()] || 0;

    if (currentCount >= WORKSHOP_CONFIG.general.maxCapacity) {
      return NextResponse.json({ 
        error: 'Sorry! This slot just filled up. Please select another time.' 
      }, { status: 409 });
    }

    // 3. Centralized Workshop Config
    const config = WORKSHOP_CONFIG.pricing[slot as SlotId] || WORKSHOP_CONFIG.pricing.A;

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: WORKSHOP_CONFIG.general.currency.toLowerCase(),
            product_data: {
              name: config.label,
              description: `Date: ${dateStr} | Category: ${config.group} | Slot: ${slot}`,
            },
            unit_amount: config.priceInCents, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      invoice_creation: {
        enabled: true,
      },
      customer_email: email,
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      metadata: {
        booking_date: dateStr,
        customer_name: name,
        customer_email: email,
        slot_id: slot,
        get_notified: getNotified ? 'true' : 'false',
      },
    });

    return NextResponse.json({ 
      success: true, 
      url: session.url 
    });

  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment session' }, { status: 500 });
  }
}
