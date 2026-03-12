import { NextResponse } from 'next/server';
import { getGoogleAuthToken } from '@/lib/googleCalendar';
import { Resend } from 'resend';

export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, name, email, getNotified, slot } = body;

    if (!date || !name || !email || !slot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slotsData: Record<string, { group: string, time: string }> = {
      'A': { group: 'Kids', time: '3pm - 6pm' },
      'B': { group: 'Teens', time: '7pm - 10pm' },
      'C': { group: 'Adults', time: '10am - 1pm' },
      'D': { group: 'Adults', time: '2pm - 5pm' },
      'E': { group: 'Adults', time: '7pm - 10pm' },
    };

    const slotInfo = slotsData[slot] || { group: 'Workshop', time: '' };
    const dateStr = date.split('T')[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const secret = process.env.GOOGLE_CALENDAR_ID?.slice(0, 10);

    // Attempt to send Google Calendar Invite if credentials exist
    if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
      try {
        const token = await getGoogleAuthToken('https://www.googleapis.com/auth/calendar.events');

        // In Google Calendar, an all-day event ends on the NEXT day exclusively
        const endDateBuf = new Date(dateStr);
        endDateBuf.setDate(endDateBuf.getDate() + 1);
        const endDateStr = endDateBuf.toISOString().split('T')[0];

        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'nicoleliew70@gmail.com';

        const event = {
          summary: `[REQUEST] Slot ${slot}: ${slotInfo.group} - ${name}`,
          description: `Customer Name: ${name}\nCustomer Email: ${email}\nSlot: ${slot} (${slotInfo.group} @ ${slotInfo.time})\nBooking Date: ${dateStr}`,
          start: { date: dateStr },
          end: { date: endDateStr },
        };

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('Google Calendar API Error:', JSON.stringify(data, null, 2));
        } else {
          const eventId = data.id;
          
          // Send Action Email via Resend
          if (process.env.RESEND_API_KEY) {
            const emailResult = await resend.emails.send({
              from: 'Nicole Baking <onboarding@resend.dev>',
              to: ['chefnicolelsv@gmail.com'], // Only one for sandbox testing
              subject: `New Request: [Slot ${slot}] ${name} (${dateStr})`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 0; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;">
                  <!-- Header -->
                  <div style="background-color: #fdfbf7; padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f0eae1;">
                    <h1 style="color: #4a3728; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">New Booking Request</h1>
                    <p style="color: #8a7b71; font-size: 15px; margin: 8px 0 0 0;">from <strong>${name}</strong></p>
                  </div>
                  
                  <!-- Content -->
                  <div style="padding: 32px;">
                    <div style="background-color: #faf9f7; border: 1px solid #f0eae1; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 0 0 16px 0; border-bottom: 1px solid #eee;">
                            <p style="margin: 0; font-size: 13px; color: #8a7b71; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Slot Details</p>
                            <p style="margin: 4px 0 0 0; font-size: 16px; color: #4a3728; font-weight: 500;">Slot ${slot} • ${slotInfo.group}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 16px 0; border-bottom: 1px solid #eee;">
                            <p style="margin: 0; font-size: 13px; color: #8a7b71; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Date & Time</p>
                            <p style="margin: 4px 0 0 0; font-size: 16px; color: #4a3728; font-weight: 500;">${dateStr} <span style="color: #bfa892;">|</span> ${slotInfo.time}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 16px 0 0 0;">
                            <p style="margin: 0; font-size: 13px; color: #8a7b71; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Contact</p>
                            <p style="margin: 4px 0 0 0; font-size: 16px; color: #4a3728; font-weight: 500;">
                              <a href="mailto:${email}" style="color: #4a3728; text-decoration: none;">${email}</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Actions -->
                    <div style="text-align: center;">
                      <a href="${appUrl}/api/approve?action=approve&eventId=${eventId}&slot=${slot}&token=${secret}" 
                         style="display: block; width: 100%; box-sizing: border-box; background-color: #4a3728; color: #ffffff; padding: 16px 24px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; margin-bottom: 12px;">
                         Accept Booking
                      </a>
                      <a href="${appUrl}/api/approve?action=reject&eventId=${eventId}&token=${secret}" 
                         style="display: block; width: 100%; box-sizing: border-box; background-color: #ffffff; color: #dc2626; padding: 16px 24px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; border: 1px solid #fecaca;">
                         Decline
                      </a>
                    </div>
                    
                    <p style="text-align: center; color: #9ca3af; font-size: 13px; margin: 24px 0 0 0;">
                      Accepting will confirm this spot on the website calendar.
                    </p>
                  </div>
                </div>
              `
            });
            console.log('Resend Email Result:', JSON.stringify(emailResult, null, 2));
          }
        }

        console.log('Successfully added event and triggered email check.');
      } catch (calError: any) {
        console.error('Error in booking flow:', calError?.message || calError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      dateFormatted: dateStr 
    });
  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json({ error: 'Failed to submit booking' }, { status: 500 });
  }
}
