import { SignJWT, importPKCS8 } from 'jose';
import { startOfDay, endOfDay } from 'date-fns';

export async function getGoogleAuthToken(scope: string) {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!credentialsJson) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable.');
  }

  const credentials = JSON.parse(credentialsJson);
  const alg = 'RS256';
  const privateKey = await importPKCS8(credentials.private_key, alg);

  const jwt = await new SignJWT({
    iss: credentials.client_email,
    scope: scope,
    aud: 'https://oauth2.googleapis.com/token',
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to fetch Google auth token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

export async function getCalendarAvailability(startDate: Date, endDate: Date) {
  try {
    const token = await getGoogleAuthToken('https://www.googleapis.com/auth/calendar.readonly');
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!calendarId) {
      throw new Error('Missing GOOGLE_CALENDAR_ID environment variable.');
    }

    const timeMin = encodeURIComponent(startOfDay(startDate).toISOString());
    const timeMax = encodeURIComponent(endOfDay(endDate).toISOString());
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Calendar API error: ${JSON.stringify(data)}`);
    }

    const events = data.items || [];
    
    // Map of date -> { slotId: count }
    const slotCounts: Record<string, Record<string, number>> = {};

    events.forEach((event: any) => {
      const title = event.summary || '';
      
      // We count both Confirmed AND pending requests for real-time slot tracking
      // to prevent overbooking while Nicole is reviewing.
      // If you ONLY want to count confirmed, uncomment the next line:
      // if (title.includes('[REQUEST]')) return; 

      const dateString = event.start?.date || event.start?.dateTime;
      if (!dateString) return;
      
      const dayStr = dateString.split('T')[0];
      
      // Extract Slot ID from title (e.g. "Slot A:", "Slot B:")
      const slotMatch = title.match(/Slot ([A-E]):/i);
      if (!slotMatch) return;
      
      const slotId = slotMatch[1].toUpperCase();

      if (!slotCounts[dayStr]) slotCounts[dayStr] = {};
      if (!slotCounts[dayStr][slotId]) slotCounts[dayStr][slotId] = 0;
      
      slotCounts[dayStr][slotId]++;
    });

    return slotCounts;
  } catch (error) {
    console.error('Error fetching calendar availability:', error);
    return {};
  }
}

export async function updateCalendarEvent(eventId: string, updates: any) {
  const token = await getGoogleAuthToken('https://www.googleapis.com/auth/calendar.events');
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId || '')}/events/${eventId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update event: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export async function deleteCalendarEvent(eventId: string) {
  const token = await getGoogleAuthToken('https://www.googleapis.com/auth/calendar.events');
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId || '')}/events/${eventId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(`Failed to delete event: ${JSON.stringify(error)}`);
  }

  return true;
}
