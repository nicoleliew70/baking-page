import { google } from 'googleapis';
import { startOfDay, endOfDay } from 'date-fns';

// We initialize the Google Calendar API client using a Service Account.
// A Service Account is an invisible bot user. It doesn't have access to the baker's personal emails,
// photos, or drive files. The baker ONLY shares a specific calendar with this bot's email address.
export async function getCalendarClient() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  
  if (!credentialsJson) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable.');
  }

  const credentials = JSON.parse(credentialsJson);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'], // READ-ONLY: the bot cannot delete or edit events!
  });

  return google.calendar({ version: 'v3', auth });
}

export async function getBookedDates(startDate: Date, endDate: Date) {
  try {
    const calendar = await getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!calendarId) {
      throw new Error('Missing GOOGLE_CALENDAR_ID environment variable.');
    }

    const response = await calendar.events.list({
      calendarId,
      timeMin: startOfDay(startDate).toISOString(),
      timeMax: endOfDay(endDate).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // Extract simply an array of date strings (YYYY-MM-DD) that are marked as busy/booked.
    const bookedDates = events.map(event => {
      // If it's a full-day event, it has event.start.date
      // If it's a specific time event, it has event.start.dateTime
      const dateString = event.start?.date || event.start?.dateTime;
      if (!dateString) return null;
      
      // We just want the 'YYYY-MM-DD' part for comparison on the frontend
      return dateString.split('T')[0];
    }).filter(Boolean) as string[];

    return bookedDates;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    // If there's an error (e.g. invalid creds during dev), fail gracefully and return empty array.
    return [];
  }
}
