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
          description: `Customer Name: ${name}\nCustomer Email: ${email}\nWants Marketing: ${getNotified ? 'Yes' : 'No'}\n\nThis booking request was placed via the website.`,
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
          throw new Error(`Calendar API error: ${JSON.stringify(data)}`);
        }

        console.log('Successfully sent calendar invite to Nicole.');
      } catch (calError) {
        console.error('Error creating calendar invite:', calError);
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
