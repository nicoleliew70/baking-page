import { NextResponse } from 'next/server';
import { updateCalendarEvent, deleteCalendarEvent, getCalendarEvent } from '@/lib/googleCalendar';
import { Resend } from 'resend';

export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const action = searchParams.get('action'); // 'approve' or 'reject'
  const slot = searchParams.get('slot');
  const token = searchParams.get('token');

  const secret = process.env.GOOGLE_CALENDAR_ID?.slice(0, 10); // Simple token for verification

  if (!eventId || !action || token !== secret) {
    return new NextResponse('Invalid request or unauthorized', { status: 400 });
  }

  const slotsData: Record<string, string> = {
    'A': 'Kids',
    'B': 'Teens',
    'C': 'Adults',
    'D': 'Adults',
    'E': 'Adults',
  };

  try {
    if (action === 'approve') {
      const group = slotsData[slot || ''] || 'Workshop';
      
      // 1. Update calendar status immediately
      await updateCalendarEvent(eventId, {
        summary: `Slot ${slot}: ${group} (Confirmed)`,
      });

      // 2. Effort to send confirmation email to the customer
      try {
        if (process.env.RESEND_API_KEY) {
          const event = await getCalendarEvent(eventId);
          const description = event.description || '';
          
          // Parse description (matching format in book/route.ts)
          const emailMatch = description.match(/Customer Email: (.*)/);
          const nameMatch = description.match(/Customer Name: (.*)/);
          const dateMatch = description.match(/Booking Date: (.*)/);
          
          const customerEmail = emailMatch ? emailMatch[1].trim() : null;
          const customerName = nameMatch ? nameMatch[1].trim() : 'Baking Enthusiast';
          const bookingDate = dateMatch ? dateMatch[1].trim() : 'your selected date';

          if (customerEmail) {
            await resend.emails.send({
              from: 'Nicole Baking <onboarding@resend.dev>',
              to: [customerEmail],
              subject: 'Booking Confirmed! 🧁 - Nicole Baking',
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 0; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;">
                  <div style="background-color: #fdfbf7; padding: 40px 32px; text-align: center; border-bottom: 1px solid #f0eae1;">
                    <div style="font-size: 40px; margin-bottom: 16px;">🧁</div>
                    <h1 style="color: #4a3728; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Booking Confirmed!</h1>
                  </div>
                  <div style="padding: 32px; color: #4a3728;">
                    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Hi <strong>${customerName}</strong>,<br><br>
                      Great news! Your booking for the <strong>Slot ${slot} (${group})</strong> workshop has been officially confirmed by Nicole.
                    </p>
                    
                    <div style="background-color: #faf9f7; border: 1px solid #f0eae1; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                      <p style="margin: 0; font-size: 11px; color: #8a7b71; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Workshop Details</p>
                      <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #4a3728;">${bookingDate}</p>
                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #8a7b71;">Slot ${slot} • ${group}</p>
                    </div>

                    <p style="font-size: 14px; line-height: 1.6; color: #8a7b71; background: #fdfbf7; padding: 20px; border-radius: 12px; border: 1px solid #f0eae1;">
                      <strong>Note:</strong> If you haven't already, please ensure you have settled the payment via WhatsApp to secure your spot.
                    </p>

                    <div style="margin-top: 32px; text-align: center;">
                      <a href="https://wa.me/601133848412" style="background-color: #4a3728; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block;">
                        Chat with Nicole on WhatsApp
                      </a>
                    </div>
                  </div>
                  <div style="background-color: #faf9f7; padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f0f0f0;">
                    We look forward to baking with you!<br>
                    <strong>Nicole Baking</strong>
                  </div>
                </div>
              `
            });
            console.log(`Confirmation email sent to customer: ${customerEmail}`);
          }
        }
      } catch (emailError) {
        // We log error but don't stop the success response for the baker
        console.error('Customer email notification failed:', emailError);
      }

      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fdfbf7; }
              .card { background-color: #ffffff; padding: 48px 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f0eae1; text-align: center; max-width: 400px; width: 90%; }
              .icon { background-color: #ecfdf5; color: #10b981; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 24px; }
              h1 { color: #4a3728; margin: 0 0 12px; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; }
              p { color: #8a7b71; margin: 0 0 32px; font-size: 15px; line-height: 1.5; }
              button { background-color: #4a3728; color: #ffffff; padding: 14px 24px; font-size: 15px; font-weight: 600; border: none; border-radius: 12px; cursor: pointer; width: 100%; transition: opacity 0.2s; }
              button:hover { opacity: 0.9; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">✓</div>
              <h1>Booking Approved</h1>
              <p>Slot ${slot} has been confirmed. A confirmation email has been sent to the customer.</p>
              <button onclick="window.close()">Close this window</button>
            </div>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    } else if (action === 'reject') {
      await deleteCalendarEvent(eventId);
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fdfbf7; }
              .card { background-color: #ffffff; padding: 48px 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f0eae1; text-align: center; max-width: 400px; width: 90%; }
              .icon { background-color: #fef2f2; color: #ef4444; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 24px; }
              h1 { color: #4a3728; margin: 0 0 12px; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; }
              p { color: #8a7b71; margin: 0 0 32px; font-size: 15px; line-height: 1.5; }
              button { background-color: #ffffff; border: 1px solid #fecaca; color: #dc2626; padding: 14px 24px; font-size: 15px; font-weight: 600; border-radius: 12px; cursor: pointer; width: 100%; transition: background-color 0.2s; }
              button:hover { background-color: #fef2f2; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">✕</div>
              <h1>Booking Declined</h1>
              <p>The request has been removed. This seat is now available for others to book.</p>
              <button onclick="window.close()">Close this window</button>
            </div>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    return new NextResponse('Invalid action', { status: 400 });
  } catch (error) {
    console.error('Action error:', error);
    return new NextResponse('Error performing action', { status: 500 });
  }
}
