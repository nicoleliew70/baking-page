import { NextResponse } from 'next/server';
import { google } from 'googleapis';

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
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/calendar.events'],
        });

        const calendar = google.calendar({ version: 'v3', auth });
        
        // In Google Calendar, an all-day event ends on the NEXT day exclusively
        const endDateBuf = new Date(dateStr);
        endDateBuf.setDate(endDateBuf.getDate() + 1);
        const endDateStr = endDateBuf.toISOString().split('T')[0];

        const event = {
          summary: `Baking Class Request: ${name}`,
          description: `Customer Name: ${name}\nCustomer Email: ${email}\nWants Marketing: ${getNotified ? 'Yes' : 'No'}\n\nTo ACCEPT this booking and block this date on the website, simply click "Yes" on this invite!`,
          start: { date: dateStr },
          end: { date: endDateStr },
          attendees: [
            { email: 'nicoleliew70@gmail.com' } // The baker receives the invite
          ],
        };

        await calendar.events.insert({
          calendarId: 'primary', // The bot's own internal calendar
          sendUpdates: 'all',    // This is what sends the email invite to Nicole!
          requestBody: event,
        });

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
