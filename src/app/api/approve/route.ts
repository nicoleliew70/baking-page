import { NextResponse } from 'next/server';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/googleCalendar';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const action = searchParams.get('action'); // 'approve' or 'reject'
  const token = searchParams.get('token');

  const secret = process.env.GOOGLE_CALENDAR_ID?.slice(0, 10); // Simple token for verification

  if (!eventId || !action || token !== secret) {
    return new NextResponse('Invalid request or unauthorized', { status: 400 });
  }

  try {
    if (action === 'approve') {
      // Fetch the event first to get current summary? 
      // Actually, we can just patch it to remove [REQUEST]
      // Since we don't easily have the current summary here without another fetch, 
      // we'll just rename it to a clean version.
      await updateCalendarEvent(eventId, {
        summary: 'Baking Class (Confirmed)',
      });
      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fdfbf7;">
            <div style="text-align: center; padding: 40px; background: white; border-radius: 20px; shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #eee;">
              <h1 style="color: #4a3728;">Booking Approved! ✅</h1>
              <p style="color: #666;">The date has been marked as booked on your website.</p>
              <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #4a3728; color: white; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
            </div>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    } else if (action === 'reject') {
      await deleteCalendarEvent(eventId);
      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fdfbf7;">
            <div style="text-align: center; padding: 40px; background: white; border-radius: 20px; shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #eee;">
              <h1 style="color: #8b0000;">Booking Rejected ❌</h1>
              <p style="color: #666;">The event has been removed from your calendar and the date remains available.</p>
              <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #8b0000; color: white; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
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
