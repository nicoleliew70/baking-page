import { NextResponse } from 'next/server';
import { getCalendarAvailability } from '@/lib/googleCalendar';
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    // Default to resolving to the current month if not provided
    const baseDate = dateParam ? new Date(dateParam) : new Date();

    // Fetch dates booked for a flexible window: previous, current, and next month
    // so the user can click fast without constant loading.
    const startRange = subMonths(startOfMonth(baseDate), 1);
    const endRange = addMonths(endOfMonth(baseDate), 1);

    const slotCounts = await getCalendarAvailability(startRange, endRange);

    const sheetId = process.env.GOOGLE_SHEET_ID;
    let allowedDates: string[] = [];
    if (sheetId) {
      const { getAllowedDatesFromSheet } = await import('@/lib/googleSheets');
      allowedDates = await getAllowedDatesFromSheet(sheetId);
    } else {
      // Fallback if not configured yet
      allowedDates = ['2026-04-04', '2026-04-05'];
    }

    return NextResponse.json({ slotCounts, allowedDates });
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
