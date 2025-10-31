
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Example response structure:
 * {
 *   bookingOptions: [
 *     {
 *       type: 'train',
 *       provider: 'IndianRailAPI',
 *       details: '12565 - TRAIN NAME',
 *       duration: '20:30',
 *       price: 'INR 500',
 *       bookingLink: 'https://www.irctc.co.in/',
 *       ecoFriendly: true,
 *       availability: 'GNWL28/WL15 (06-10-2018)'
 *     },
 *     ...
 *   ]
 * }
 */

const INDIAN_RAIL_BASE = "https://indianrailapi.com/api/v2";
const API_KEY = process.env.INDIAN_RAIL_API_KEY;

function formatCurrency(amount:number|string, currency='INR') {
  if (typeof amount === 'number') return `${currency} ${amount}`;
  return `${currency} ${amount}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing INDIAN_RAIL_API_KEY env var" });
    }

    const trainNo = (req.query.trainNo || req.query.train || "").toString();
    const from = (req.query.from || "").toString();
    const to = (req.query.to || "").toString();
    // date expected as yyyyMMdd e.g. 20251110
    const date = (req.query.date || "").toString();
    const classCode = (req.query.class || '3A').toString(); // e.g., 1A/2A/3A/SL/CC

    if (!trainNo || !from || !to || !date) {
      return res.status(400).json({ error: "Missing required params: trainNo, from, to, date(yyyyMMdd)" });
    }

    // call indianrailapi seat availability endpoint
    const endpoint = `${INDIAN_RAIL_BASE}/SeatAvailability/apikey/${API_KEY}/TrainNumber/${encodeURIComponent(trainNo)}/From/${encodeURIComponent(from)}/To/${encodeURIComponent(to)}/Date/${encodeURIComponent(date)}/Quota/GN/Class/${encodeURIComponent(classCode)}`;

    const apiRes = await fetch(endpoint);
    if (!apiRes.ok) {
      const txt = await apiRes.text();
      console.error("IndianRailAPI failed:", apiRes.status, txt);
      return res.status(502).json({ error: "IndianRailAPI error", details: txt });
    }

    const json = await apiRes.json();
    // Expected shape: { ResponseCode, TrainNo, From, To, ClassCode, Quota, Availability: [...] }

    const availability = Array.isArray(json?.Availability) ? json.Availability : [];

    // Map availability array into bookingOptions (one entry per returned date row)
    const bookingOptions = availability.map((row: any) => {
      // Example row: { JourneyDate: "06-10-2018", Availability: "GNWL28/WL15", Confirm: "36 %" }
      const journeyDateRaw = row.JourneyDate || row.date || "";
      // convert dd-mm-yyyy to yyyy-mm-dd (if needed)
      let journeyDateISO = journeyDateRaw;
      const parts = (journeyDateRaw || "").split("-");
      if (parts.length === 3) {
        journeyDateISO = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
      }

      return {
        type: "train",
        provider: "IndianRailAPI",
        details: `${json?.TrainNo || trainNo} - ${json?.TrainName || ""}`.trim(),
        duration: json?.Duration || null,
        // IndianRailAPI price endpoint separate; for now include placeholder or attempt to use Confirm% from API
        price: formatCurrency(row?.Fare || "—", "INR"),
        bookingLink: `https://www.irctc.co.in/`, // fallback: IRCTC homepage (see notes)
        ecoFriendly: true,
        availability: `${row?.Availability || "N/A"} (${journeyDateISO})`,
        journeyDate: journeyDateISO,
        raw: row
      };
    });

    // If bookingOptions empty, still return helpful info
    return res.status(200).json({
      meta: {
        source: "indianrailapi.com",
        trainNumber: trainNo,
        from,
        to,
        classCode,
      },
      bookingOptions,
      raw: json
    });

  } catch (err:any) {
    console.error("Trains API error:", err);
    return res.status(500).json({ error: "Server error", details: err?.message || String(err) });
  }
}
