import { getGoogleAuthToken } from './googleCalendar';

export async function getAllowedDatesFromSheet(spreadsheetId: string): Promise<string[]> {
  try {
    const token = await getGoogleAuthToken('https://www.googleapis.com/auth/spreadsheets.readonly');
    
    // Assuming the dates are in the first column of the first sheet.
    // We fetch column A.
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/A:A`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Cache for a few seconds so we don't spam the API unnecessarily, 
      // but it's quickly updated for Nicole.
      next: { revalidate: 15 } 
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${JSON.stringify(data)}`);
    }

    const rows = data.values || [];
    
    // Filter out empty rows, headers like "Dates", and parse.
    const dates: string[] = [];
    rows.forEach((row: any[]) => {
      const cell = row[0];
      if (cell && typeof cell === 'string') {
        const trimmed = cell.trim();
        // Simple regex check for YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          dates.push(trimmed);
        }
      }
    });

    return dates;
  } catch (error) {
    console.error('Error fetching allowed dates from Google Sheet:', error);
    // If it fails, maybe return a fallback or empty array
    // Let's return empty, but log it.
    return [];
  }
}
