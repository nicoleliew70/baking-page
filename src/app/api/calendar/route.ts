import { NextResponse } from 'next/server';
import { getBookedDates } from '@/lib/googleCalendar';
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

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

    const bookedDates = await getBookedDates(startRange, endRange);

    return NextResponse.json({ bookedDates });
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
