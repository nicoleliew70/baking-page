import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getGoogleAuthToken } from '@/lib/googleCalendar';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata) {
      const { booking_date, customer_name, customer_email, slot_id } = metadata;

      // 1. Create Confirmed Event on Google Calendar
      try {
        const token = await getGoogleAuthToken('https://www.googleapis.com/auth/calendar.events');
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'nicoleliew70@gmail.com';

        const slotsData: Record<string, { label: string, group: string, time: string }> = {
          'A': { label: 'Kids Baking Fun', group: 'Kids', time: '3pm - 6pm' },
          'B': { label: 'Teens Sourdough Mastery', group: 'Teens', time: '7pm - 10pm' },
          'C': { label: 'Classic French Pastry (AM)', group: 'Adults', time: '10am - 1pm' },
          'D': { label: 'Sourdough Fundamentals (PM)', group: 'Adults', time: '2pm - 5pm' },
          'E': { label: 'Artisan Pastry Arts (Eve)', group: 'Adults', time: '7pm - 10pm' },
        };

        const slotInfo = slotsData[slot_id] || { label: 'Baking Workshop', group: 'Adults', time: '' };
        const amountPaid = (session.amount_total || 0) / 100;
        
        const slotTimes: Record<string, { start: string, end: string }> = {
          'A': { start: '15:00:00', end: '18:00:00' },
          'B': { start: '19:00:00', end: '22:00:00' },
          'C': { start: '10:00:00', end: '13:00:00' },
          'D': { start: '14:00:00', end: '17:00:00' },
          'E': { start: '19:00:00', end: '22:00:00' },
        };
        const timeConfig = slotTimes[slot_id] || { start: '09:00:00', end: '10:00:00' };

        const calendarEvent = {
          summary: `[PAID] ${slotInfo.label} - ${customer_name}`,
          description: `Customer: ${customer_name}\nEmail: ${customer_email}\nSlot: ${slot_id} (${slotInfo.group})\nPayment ID: ${session.id}\nStatus: PAID`,
          start: { 
            dateTime: `${booking_date}T${timeConfig.start}+08:00`,
            timeZone: 'Asia/Kuala_Lumpur'
          },
          end: { 
            dateTime: `${booking_date}T${timeConfig.end}+08:00`,
            timeZone: 'Asia/Kuala_Lumpur'
          },
        };

        await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        });

        // 2. Send Confirmation Email to Customer
        await resend.emails.send({
          from: 'Nicole Baking <onboarding@resend.dev>',
          to: [customer_email],
          subject: 'Payment Received! Your Booking is Confirmed 🧁',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #4a3728; text-align: center;">Welcome to the Workshop!</h1>
              <p>Hi <strong>${customer_name}</strong>,</p>
              <p>We've received your payment and your spot for the <strong>${slotInfo.label}</strong> workshop is now officially confirmed!</p>
              <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${booking_date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${slotInfo.time}</p>
                <p style="margin: 5px 0;"><strong>Amount Paid:</strong> RM ${amountPaid.toFixed(2)}</p>
              </div>
              <p>We're so excited to have you join us. If you have any questions, feel free to reach out via WhatsApp.</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/601133848412" style="background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Chat on WhatsApp</a>
              </p>
            </div>
          `
        });

        // 3. Send Notification to Nicole
        await resend.emails.send({
          from: 'Nicole Baking <onboarding@resend.dev>',
          to: ['chefnicolelsv@gmail.com'],
          subject: `💰 RM ${amountPaid.toFixed(2)} Paid - ${customer_name}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: #10b981;">New Paid Booking!</h2>
              <p><strong>Customer:</strong> ${customer_name}</p>
              <p><strong>Email:</strong> ${customer_email}</p>
              <p><strong>Workshop:</strong> ${slotInfo.label} (${slotInfo.group}) on ${booking_date}</p>
              <p><strong>Amount Paid:</strong> RM ${amountPaid.toFixed(2)}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">Google Calendar has been automatically updated with this confirmed event.</p>
            </div>
          `
        });

      } catch (err) {
        console.error('Webhook processing failed:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
