import { NextResponse } from 'next/server';
import { getCalendarAvailability } from '@/lib/googleCalendar';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-11' as any,
});

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

    // 2. 🛡️ Logic Guard 100%: Server-side capacity check
    // Fetch live data from Google to ensure the slot isn't already full
    const checkDate = new Date(dateStr);
    const availability = await getCalendarAvailability(checkDate, checkDate);
    const dayAvailability = availability[dateStr] || {};
    const currentCount = dayAvailability[slot.toUpperCase()] || 0;

    if (currentCount >= 4) {
      return NextResponse.json({ 
        error: 'Sorry! This slot just filled up. Please select another time.' 
      }, { status: 409 });
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: `Baking Workshop - Slot ${slot}`,
              description: `Date: ${dateStr} | Class: ${slot === 'A' ? 'Kids' : slot === 'B' ? 'Teens' : 'Adults'}`,
            },
            unit_amount: 15000, // RM 150.00 (in cents)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${appUrl}/?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?status=cancelled`,
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
