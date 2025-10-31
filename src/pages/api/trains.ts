
import type { NextApiRequest, NextApiResponse } from "next";

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const trainNo = (req.query.trainNo || req.query.train || "").toString();
    const from = (req.query.from || "").toString();
    const to = (req.query.to || "").toString();
    const date = (req.query.date || "").toString(); // Expects yyyy-MM-dd
    const classCode = (req.query.class || '3A').toString();

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

      return {
        type: "train",
        provider: "IndianRailways",
        details: `${trainNo} - ${trainName}`,
        duration: mockData?.Duration || '16h 0m',
        price: formatCurrency(row?.Fare || mockData?.Fare || "1850", "INR"),
        bookingLink: `https://www.ixigo.com/trains/${from}/to/${to}?date=${parts[2]}-${parts[1]}-${parts[0]}`,
        ecoFriendly: true,
        availability: `${row?.Availability || "N/A"}`,
        journeyDate: journeyDateISO,
        raw: row
      };
    });

    return res.status(200).json({
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
    return res.status(500).json({ error: "Server error", details: err?.message || String(err) });
  }
}
