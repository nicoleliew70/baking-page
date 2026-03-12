import { NextResponse } from 'next/server';
import { getGoogleAuthToken } from '@/lib/googleCalendar';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, name, email, getNotified } = body;

    if (!date || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dateStr = date.split('T')[0];

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
          summary: `[REQUEST] Baking Class: ${name}`,
          description: `
👤 **Customer:** ${name}
📧 **Email:** ${email}
📢 **Marketing Opt-in:** ${getNotified ? 'Yes' : 'No'}

---
🔔 **HOW TO ACCEPT:**
Simply edit this event title and REMOVE the "[REQUEST]" prefix. The website will then automatically mark this date as BOOKED.

❌ **HOW TO REJECT:**
Just delete this event from your calendar. The date will remain AVAILABLE on the website.
---
          `.trim(),
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
          return NextResponse.json({ 
            success: false, 
            error: 'Calendar API error', 
            details: data 
          }, { status: 500 });
        }

        console.log('Successfully sent calendar invite to Nicole.');
      } catch (calError: any) {
        console.error('Error creating calendar invite:', calError?.message || calError);
        return NextResponse.json({ 
          success: false, 
          error: calError?.message || 'Unknown calendar error' 
        }, { status: 500 });
      }
    } else {
      console.log(`[Email Mock] Invite would be sent for ${dateStr} from ${name}`);
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
