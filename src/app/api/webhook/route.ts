import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getGoogleAuthToken, getCalendarAvailability } from '@/lib/googleCalendar';
import { Resend } from 'resend';
import { WORKSHOP_CONFIG, SlotId } from '@/lib/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const resend = new Resend(process.env.RESEND_API_KEY);

export const runtime = 'edge';

export async function GET() {
  const status = {
    webhook_secret_exists: !!process.env.STRIPE_WEBHOOK_SECRET,
    stripe_key_exists: !!process.env.STRIPE_SECRET_KEY,
    resend_key_exists: !!process.env.RESEND_API_KEY,
    google_calendar_exists: !!process.env.GOOGLE_CALENDAR_ID,
    google_creds_exists: !!process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
  };
  return NextResponse.json({ 
    message: 'Webhook endpoint is active.',
    environment_check: status 
  });
}

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata) {
      const { booking_date, customer_name, customer_email, slot_id } = metadata;
      const slotId = slot_id as SlotId;
      const slotInfo = WORKSHOP_CONFIG.pricing[slotId] || WORKSHOP_CONFIG.pricing.A;
      const amountPaid = (session.amount_total || 0) / 100;

      try {
        // --- EDGE CASE #1: FINAL CAPACITY CHECK (RACE CONDITION) ---
        const checkDate = new Date(booking_date);
        const availability = await getCalendarAvailability(checkDate, checkDate);
        const currentCount = (availability[booking_date] || {})[slotId.toUpperCase()] || 0;

        if (currentCount >= WORKSHOP_CONFIG.general.maxCapacity) {
          console.warn(`Race condition detected for ${booking_date} ${slotId}. Refunding customer.`);
          
          // 1. Trigger Stripe Refund
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer', // Best fit for 'out of stock' in this context
            metadata: { reason: 'Overbooked - Race Condition' }
          });

          // 2. Email Customer Apology
          await resend.emails.send({
            from: 'Nicole Baking <onboarding@resend.dev>',
            to: [customer_email],
            subject: '⚠️ Important: Refund for your Booking',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #d41152;">We are so sorry!</h2>
                <p>Hi ${customer_name},</p>
                <p>It looks like someone grabbed the last seat for the <strong>${slotInfo.label}</strong> workshop at the exact same time as you.</p>
                <p>Because we keep our classes small (max 4 people), we have <strong>issued a full refund</strong> of RM ${amountPaid.toFixed(2)} back to your card.</p>
                <p>Please check our calendar for other available dates. We'd love to have you join another session!</p>
              </div>
            `
          });

          // 3. Notify Nicole of the overbooking/refund
          await resend.emails.send({
            from: 'Nicole Baking <onboarding@resend.dev>',
            to: [WORKSHOP_CONFIG.general.adminEmail],
            subject: '🚨 OVERBOOKING PREVENTED - Auto-Refund Issued',
            html: `<p>${customer_name} tried to book ${slotInfo.label} on ${booking_date} but it was full. They have been refunded.</p>`
          });

          return NextResponse.json({ received: true, status: 'overbooked_refunded' });
        }

        // --- NORMAL FLOW: PROCESS THE BOOKING ---
        const token = await getGoogleAuthToken('https://www.googleapis.com/auth/calendar.events');
        const calendarId = process.env.GOOGLE_CALENDAR_ID || WORKSHOP_CONFIG.general.adminEmail;

        const slotTimes: Record<string, { start: string, end: string }> = {
          'A': { start: '15:00:00', end: '18:00:00' },
          'B': { start: '19:00:00', end: '22:00:00' },
          'C': { start: '10:00:00', end: '13:00:00' },
          'D': { start: '14:00:00', end: '17:00:00' },
          'E': { start: '19:00:00', end: '22:00:00' },
        };
        const timeConfig = slotTimes[slotId] || { start: '09:00:00', end: '10:00:00' };

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

        const calResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(calendarEvent),
        });

        // EDGE CASE #4: Google Calendar Fail Fallback
        if (!calResponse.ok) {
          throw new Error('Google Calendar API failed');
        }

        // Send confirmation email
        await resend.emails.send({
          from: 'Nicole Baking <onboarding@resend.dev>',
          to: [customer_email],
          subject: 'Payment Received! Your Booking is Confirmed 🧁',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #d41152; text-align: center;">Welcome to the Workshop!</h1>
              <p>Hi <strong>${customer_name}</strong>,</p>
              <p>We've received your payment and your spot for the <strong>${slotInfo.label}</strong> workshop is now officially confirmed!</p>
              <div style="background: #fafafa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${booking_date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${slotInfo.time}</p>
                <p style="margin: 5px 0;"><strong>Amount Paid:</strong> RM ${amountPaid.toFixed(2)}</p>
              </div>
              <p><strong>Cancellation Policy:</strong> ${WORKSHOP_CONFIG.general.cancellationPolicy}</p>
              <p>We're so excited to have you join us. If you have any questions, feel free to reach out via WhatsApp.</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/${WORKSHOP_CONFIG.general.whatsappNumber}" style="background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Chat on WhatsApp</a>
              </p>
            </div>
          `
        });

        // Notify Nicole
        await resend.emails.send({
          from: 'Nicole Baking <onboarding@resend.dev>',
          to: [WORKSHOP_CONFIG.general.adminEmail],
          subject: `💰 RM ${amountPaid.toFixed(2)} Paid - ${customer_name}`,
          html: `<p>New booking confirmed for ${customer_name} on ${booking_date}.</p>`
        });

      } catch (err: any) {
        console.error('Webhook processing failed:', err);
        // EDGE CASE #4: Fallback notification to Nicole if automation fails
        await resend.emails.send({
          from: 'Nicole Baking <onboarding@resend.dev>',
          to: [WORKSHOP_CONFIG.general.adminEmail],
          subject: '🚨 ACTION REQUIRED: Booking Automation Failed',
          html: `<p>A payment of RM ${amountPaid.toFixed(2)} was received from ${customer_name}, but the calendar invite or email failed. Please check Stripe and add manually.</p><p>Error: ${err.message}</p>`
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
