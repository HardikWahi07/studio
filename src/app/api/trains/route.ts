
import { NextRequest, NextResponse } from "next/server";

// This is a mock API implementation.
// In a real application, you would fetch this data from a live train API.

const mockResponses: { [key: string]: any } = {
  "12951": { // Mumbai to Delhi
    "ResponseCode": 200,
    "TrainNo": "12951",
    "TrainName": "MUMBAI RAJDHANI",
    "From": "BCT",
    "To": "NDLS",
    "Availability": [
      { "JourneyDate": "15-07-2024", "Availability": "GNWL10/WL5", "Confirm": "80 %" },
      { "JourneyDate": "16-07-2024", "Availability": "AVAILABLE 80", "Confirm": "100 %" },
      { "JourneyDate": "17-07-2024", "Availability": "REGRET/WL1", "Confirm": "0 %" }
    ],
    "Fare": "2500"
  },
  "12952": { // Delhi to Mumbai
    "ResponseCode": 200,
    "TrainNo": "12952",
    "TrainName": "MUMBAI RAJDHANI",
    "From": "NDLS",
    "To": "BCT",
    "Availability": [
        { "JourneyDate": "15-07-2024", "Availability": "AVAILABLE 120", "Confirm": "100 %" },
        { "JourneyDate": "16-07-2024", "Availability": "AVAILABLE 95", "Confirm": "100 %" }
    ],
    "Fare": "2800"
  }
};


function formatCurrency(amount:number|string, currency='INR') {
  if (typeof amount === 'number') return `${currency} ${amount}`;
  return `${currency} ${amount}`;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const trainNo = (searchParams.get("trainNo") || searchParams.get("train") || "").toString();
    const from = (searchParams.get("from") || "").toString();
    const to = (searchParams.get("to") || "").toString();
    const date = (searchParams.get("date") || "").toString(); // Expects yyyy-MM-dd
    const classCode = (searchParams.get("class") || '3A').toString();

    // Use mock data for the demo
    const mockData = mockResponses[trainNo] || { Availability: [], TrainName: 'UNKNOWN TRAIN', ResponseCode: 404 };

    const availability = Array.isArray(mockData?.Availability) ? mockData.Availability : [];

    const bookingOptions = availability.map((row: any) => {
      const journeyDateRaw = row.JourneyDate || "";
      let journeyDateISO = journeyDateRaw;
      const parts = (journeyDateRaw || "").split("-");
      if (parts.length === 3) {
        journeyDateISO = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
      }

      const trainName = mockData.TrainName || 'Special Train';
      
      const ixigoDate = parts.length === 3 ? `${parts[0]}-${parts[1]}-${parts[2]}` : date;

      return {
        type: "train",
        provider: "IndianRailways",
        details: `${trainNo} - ${trainName}`,
        duration: mockData?.Duration || '16h 0m',
        price: formatCurrency(row?.Fare || mockData?.Fare || "1850", "INR"),
        bookingLink: `https://www.ixigo.com/trains/${from}/to/${to}?date=${ixigoDate}`,
        ecoFriendly: true,
        availability: `${row?.Availability || "N/A"}`,
        journeyDate: journeyDateISO,
        raw: row
      };
    });

    return NextResponse.json({
      meta: {
        source: "mock-indianrailapi.com",
        trainNumber: trainNo,
        from,
        to,
        classCode,
      },
      bookingOptions,
      raw: mockData
    });

  } catch (err:any) {
    console.error("Trains API error:", err);
    return NextResponse.json({ error: "Server error", details: err?.message || String(err) }, { status: 500 });
  }
}
