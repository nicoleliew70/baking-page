import { NextResponse } from 'next/server';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/googleCalendar';

export const runtime = 'edge';

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
      await updateCalendarEvent(eventId, {
        summary: `Slot ${slot}: ${group} (Confirmed)`,
      });
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
              <p>Slot ${slot} has been confirmed. The website calendar has been updated to reflect the remaining seats.</p>
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
