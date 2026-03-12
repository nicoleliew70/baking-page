import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getGoogleAuthToken, getCalendarAvailability } from '@/lib/googleCalendar';
import { Resend } from 'resend';
import { WORKSHOP_CONFIG, SlotId } from '@/lib/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendCustomerEmail({ to, toName, subject, html }: { to: string; toName: string; subject: string; html: string }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Nicole Baking', email: 'chefnicolelsv@gmail.com' },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo error: ${await res.text()}`);
}

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
    event = await stripe.webhooks.constructEventAsync(
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
          await sendCustomerEmail({
            to: customer_email,
            toName: customer_name,
            subject: '⚠️ Important: Full Refund Issued for Your Booking',
            html: `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9f5f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr><td style="background:#f5a623;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;">We're so sorry, ${customer_name} 😔</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="font-size:15px;color:#555;line-height:1.7;">It looks like someone grabbed the last seat for <strong>${slotInfo.label}</strong> on <strong>${booking_date}</strong> at the exact same moment as you. Because we keep our classes small (max 4 people), we weren't able to hold your spot.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
            <p style="margin:0;font-size:13px;color:#166534;text-transform:uppercase;letter-spacing:1px;">Full Refund Issued</p>
            <p style="margin:8px 0 0;font-size:28px;color:#15803d;font-weight:700;">RM ${amountPaid.toFixed(2)}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#166534;">Expect it back on your card within 5–10 business days.</p>
          </div>
          <p style="font-size:15px;color:#555;line-height:1.7;">We'd love to have you join another session — please check our calendar for other available dates. We're sorry for the inconvenience!</p>
          <p style="text-align:center;margin-top:28px;">
            <a href="https://wa.me/${WORKSHOP_CONFIG.general.whatsappNumber}" style="display:inline-block;background:#25D366;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:50px;text-decoration:none;">💬 Chat with us on WhatsApp</a>
          </p>
        </td></tr>
        <tr><td style="background:#f9f5f0;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#aaa;">© ${new Date().getFullYear()} Nicole Baking. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
          });

          // 3. Notify Nicole of the overbooking/refund
          await resend.emails.send({
            from: 'Nicole Baking <onboarding@resend.dev>',
            to: [WORKSHOP_CONFIG.general.adminEmail],
            subject: '🚨 OVERBOOKING PREVENTED – Auto-Refund Issued',
            html: `
<!DOCTYPE html>
<html><body style="font-family:sans-serif;padding:20px;">
  <div style="background:#fff3cd;border-left:4px solid #f5a623;padding:20px;border-radius:0 8px 8px 0;max-width:560px;">
    <h2 style="margin:0 0 12px;color:#b07d00;">🚨 Overbooking Prevented</h2>
    <p style="margin:0 0 6px;"><strong>Customer:</strong> ${customer_name} (${customer_email})</p>
    <p style="margin:0 0 6px;"><strong>Workshop:</strong> ${slotInfo.label} on ${booking_date}</p>
    <p style="margin:0 0 6px;"><strong>Refund Issued:</strong> RM ${amountPaid.toFixed(2)}</p>
    <p style="margin:12px 0 0;font-size:13px;color:#888;">The slot was full when payment completed. A full refund was automatically issued and the customer was notified.</p>
  </div>
</body></html>`
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

        // Send confirmation email to customer
        await sendCustomerEmail({
          to: customer_email,
          toName: customer_name,
          subject: `✅ Booking Confirmed – ${slotInfo.label} on ${booking_date}`,
          html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f9f5f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f5f0;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d41152 0%,#a00d3d 100%);padding:40px 40px 30px;text-align:center;">
            <p style="margin:0 0 8px;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Booking Confirmation</p>
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">You're all set! 🧁</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:36px 40px 0;">
            <p style="margin:0;font-size:16px;color:#333;line-height:1.6;">Hi <strong>${customer_name}</strong>,</p>
            <p style="margin:12px 0 0;font-size:15px;color:#555;line-height:1.7;">
              Your payment has been received and your spot is officially confirmed. We can't wait to bake with you!
            </p>
          </td>
        </tr>

        <!-- Booking Details Card -->
        <tr>
          <td style="padding:28px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f8;border:1px solid #f0d8e0;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #f0d8e0;">
                  <p style="margin:0;font-size:11px;color:#d41152;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Workshop</p>
                  <p style="margin:6px 0 0;font-size:18px;color:#1a1a1a;font-weight:700;">${slotInfo.label}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#888;">${slotInfo.group} Class · ${slotInfo.duration}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:16px 24px;border-right:1px solid #f0d8e0;width:50%;">
                        <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">📅 Date</p>
                        <p style="margin:6px 0 0;font-size:15px;color:#1a1a1a;font-weight:600;">${booking_date}</p>
                      </td>
                      <td style="padding:16px 24px;width:50%;">
                        <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">🕐 Time</p>
                        <p style="margin:6px 0 0;font-size:15px;color:#1a1a1a;font-weight:600;">${slotInfo.time}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 24px;border-top:1px solid #f0d8e0;border-right:1px solid #f0d8e0;">
                        <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">💳 Amount Paid</p>
                        <p style="margin:6px 0 0;font-size:15px;color:#1a1a1a;font-weight:600;">RM ${amountPaid.toFixed(2)}</p>
                      </td>
                      <td style="padding:16px 24px;border-top:1px solid #f0d8e0;">
                        <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">📧 Email</p>
                        <p style="margin:6px 0 0;font-size:14px;color:#1a1a1a;font-weight:600;">${customer_email}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What to Expect -->
        <tr>
          <td style="padding:28px 40px 0;">
            <h2 style="margin:0 0 16px;font-size:16px;color:#1a1a1a;font-weight:700;">What to expect 👩‍🍳</h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:28px;font-size:18px;">🧴</td>
                <td style="padding:10px 0;font-size:14px;color:#555;line-height:1.6;">All ingredients and equipment are provided — just bring yourself and your appetite!</td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:28px;font-size:18px;">📦</td>
                <td style="padding:10px 0;font-size:14px;color:#555;line-height:1.6;">You'll take home everything you bake on the day.</td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:28px;font-size:18px;">👥</td>
                <td style="padding:10px 0;font-size:14px;color:#555;line-height:1.6;">Classes are kept small (max 4 people) for a personal, hands-on experience.</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Cancellation Policy -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border-left:4px solid #f5a623;border-radius:0 8px 8px 0;padding:16px 20px;">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;color:#b07d00;font-weight:700;text-transform:uppercase;letter-spacing:1px;">⚠️ Cancellation Policy</p>
                  <p style="margin:8px 0 0;font-size:13px;color:#7a5800;line-height:1.6;">${WORKSHOP_CONFIG.general.cancellationPolicy}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:32px 40px;text-align:center;">
            <p style="margin:0 0 20px;font-size:14px;color:#555;">Have questions? We're just a message away.</p>
            <a href="https://wa.me/${WORKSHOP_CONFIG.general.whatsappNumber}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:50px;text-decoration:none;">💬 Chat on WhatsApp</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f5f0;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#aaa;">© ${new Date().getFullYear()} Nicole Baking. All rights reserved.</p>
            <p style="margin:6px 0 0;font-size:12px;color:#bbb;">This is an automated confirmation email. Please do not reply.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
        });

        // Notify Nicole (admin) via Resend
        await resend.emails.send({
          from: 'Nicole Baking <onboarding@resend.dev>',
          to: [WORKSHOP_CONFIG.general.adminEmail],
          subject: `💰 New Booking – RM ${amountPaid.toFixed(2)} from ${customer_name}`,
          html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:560px;width:100%;">
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;">
            <p style="margin:0;color:#d41152;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Admin Alert</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;">New Booking Confirmed ✅</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;width:40%;">Customer</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a1a1a;font-weight:600;">${customer_name}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;border-top:1px solid #eee;">Email</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a1a1a;border-top:1px solid #eee;">${customer_email}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;border-top:1px solid #eee;">Workshop</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a1a1a;border-top:1px solid #eee;font-weight:600;">${slotInfo.label}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;border-top:1px solid #eee;">Date & Time</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a1a1a;border-top:1px solid #eee;">${booking_date} · ${slotInfo.time}</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px 16px;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;border-top:1px solid #eee;">Amount Paid</td>
                <td style="padding:12px 16px;font-size:16px;color:#d41152;border-top:1px solid #eee;font-weight:700;">RM ${amountPaid.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;border-top:1px solid #eee;">Slot</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a1a1a;border-top:1px solid #eee;">${slot_id} (${slotInfo.group})</td>
              </tr>
            </table>
            <p style="margin:20px 0 0;font-size:13px;color:#aaa;">A Google Calendar event has been created automatically.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
        });

      } catch (err: any) {
        console.error('Webhook processing failed:', err);
        await resend.emails.send({
          from: 'Nicole Baking <onboarding@resend.dev>',
          to: [WORKSHOP_CONFIG.general.adminEmail],
          subject: '🚨 ACTION REQUIRED: Booking Automation Failed',
          html: `
<!DOCTYPE html>
<html><body style="font-family:sans-serif;padding:20px;">
  <div style="background:#fff3f3;border-left:4px solid #d41152;padding:20px;border-radius:0 8px 8px 0;max-width:560px;">
    <h2 style="margin:0 0 12px;color:#d41152;">🚨 Booking Automation Failed</h2>
    <p style="margin:0 0 8px;"><strong>Customer:</strong> ${customer_name} (${customer_email})</p>
    <p style="margin:0 0 8px;"><strong>Amount Paid:</strong> RM ${amountPaid.toFixed(2)}</p>
    <p style="margin:0 0 8px;"><strong>Workshop:</strong> ${slotInfo.label} on ${booking_date}</p>
    <p style="margin:16px 0 8px;"><strong>Error:</strong></p>
    <pre style="background:#1a1a1a;color:#ff6b6b;padding:12px;border-radius:6px;font-size:12px;overflow:auto;">${err.message}</pre>
    <p style="margin:16px 0 0;color:#888;font-size:13px;">Please check Stripe, add the calendar event manually, and confirm with the customer.</p>
  </div>
</body></html>`
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
