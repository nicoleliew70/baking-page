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
            await resend.emails.send({
              from: 'Nicole Baking <onboarding@resend.dev>',
              to: ['nicoleliew70@gmail.com', 'chefnicolelsv@gmail.com'],
              subject: `New Request: [Slot ${slot}] ${name} (${dateStr})`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
                  <h2 style="color: #4a3728;">New Workshop Booking</h2>
                  <p>You have a new request from <strong>${name}</strong>.</p>
                  <div style="background: #fdfbf7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Slot:</strong> Slot ${slot} (${slotInfo.group})</p>
                    <p><strong>Time:</strong> ${slotInfo.time}</p>
                    <p><strong>Date:</strong> ${dateStr}</p>
                    <p><strong>Email:</strong> ${email}</p>
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <a href="${appUrl}/api/approve?action=approve&eventId=${eventId}&slot=${slot}&token=${secret}" 
                       style="background: #4a3728; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                       Approve Slot ${slot}
                    </a>
                    <a href="${appUrl}/api/approve?action=reject&eventId=${eventId}&token=${secret}" 
                       style="background: #fff; color: #8b0000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; border: 1px solid #8b0000;">
                       Decline
                    </a>
                  </div>
                </div>
              `
            });
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
