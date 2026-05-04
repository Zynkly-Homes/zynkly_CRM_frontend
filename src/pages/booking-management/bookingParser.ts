// ── Smart raw-text parser for booking creation ─────────────────────────────
// Handles both WhatsApp template format and plain unstructured text.

export interface ParsedBookingFields {
  user_name: string;
  user_phone: string;
  address: string;
  live_location_url: string;
  branch: string;
  booking_via: string;
  booking_created_date_and_time: string;
}

// Lines from the WhatsApp template that contain no real data
const TEMPLATE_NOISE = [
  /zynkly/i, /catalogue/i, /wa\.me/i, /hello/i, /service/i,
  /please/i, /confirm/i, /availability/i, /thank/i,
  /choose your/i, /details\s*:/i, /preferred timing/i,
];

function isNoiseLine(line: string): boolean {
  const clean = line.replace(/[📞📍🚪🏢⏰👋🌐✅🙏⚡]/g, "").trim();
  if (!clean) return true;
  return TEMPLATE_NOISE.some((re) => re.test(clean));
}

function localDateTimeNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Extract value after a label pattern, e.g. "📞 Contact Number: 7500560748"
function labeled(text: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const val = m[1].replace(/[📞📍🚪🏢⏰👋🌐]/g, "").trim();
      if (val && val !== "(please share your location here)") return val;
    }
  }
  return "";
}

export function parseBookingRawText(raw: string): ParsedBookingFields {
  const text = raw.replace(/\r/g, "");

  // ── 1. Phone number ────────────────────────────────────────────────────────
  let user_phone = "";
  const phoneMatch = text.match(/(?:\+91|91)?([6-9]\d{9})\b/);
  if (phoneMatch) {
    user_phone = "+91" + phoneMatch[1];
  }

  // ── 2. URL (live location) ─────────────────────────────────────────────────
  let live_location_url = "";
  const urlMatch = text.match(/https?:\/\/[^\s,\n]+/);
  if (urlMatch) {
    live_location_url = urlMatch[0];
  }

  // ── 3. Labeled fields (WhatsApp template format) ───────────────────────────
  const pgName = labeled(text, [
    /(?:Building\s*\/\s*PG\s*Name|PG\s*Name|Building Name|Building)\s*:?\s*([^\n]+)/i,
  ]);
  const room = labeled(text, [
    /(?:Room\s*(?:Number|No|#)|Flat\s*(?:No|Number)|Room)\s*:?\s*([^\n]+)/i,
  ]);
  const contactFromLabel = labeled(text, [
    /(?:Contact\s*(?:Number|No)|Mobile|Phone)\s*:?\s*([^\n]+)/i,
  ]);
  const user_name = labeled(text, [
    /(?:Customer\s*Name|Name)\s*:?\s*([^\n]+)/i,
  ]);
  const liveLocLabel = labeled(text, [
    /(?:Live\s*Location|Location)\s*:?\s*([^\n]+)/i,
  ]);

  if (!live_location_url && liveLocLabel?.startsWith("http")) {
    live_location_url = liveLocLabel;
  }
  if (!user_phone && contactFromLabel) {
    const m = contactFromLabel.match(/([6-9]\d{9})/);
    if (m) user_phone = "+91" + m[1];
  }

  // ── 4. Build address ───────────────────────────────────────────────────────
  let address = pgName;
  if (address && room) address = `${address}, Room ${room}`;

  // ── 5. Fallback: unstructured text ─────────────────────────────────────────
  if (!address) {
    const lines = text
      .split("\n")
      .map((l) => l.replace(/[📞📍🚪🏢⏰👋🌐✅🙏⚡]/g, "").trim())
      .filter((l) => {
        if (!l || isNoiseLine(l)) return false;
        if (/^(?:\+91|91)?[6-9]\d{9}$/.test(l.replace(/\s/g, ""))) return false; // phone only
        if (/^https?:\/\//.test(l)) return false; // URL
        if (/^\d{1,5}$/.test(l)) return false; // short standalone number (room no)
        return true;
      });

    if (lines.length > 0) address = lines[0];

    // Look for a short standalone number on its own line → room number
    const roomLine = text.split("\n").find((l) => /^\s*\d{1,5}\s*$/.test(l));
    if (roomLine) {
      const rn = roomLine.trim();
      address = address ? `${address}, Room ${rn}` : `Room ${rn}`;
    }
  }

  return {
    user_name,
    user_phone,
    address,
    live_location_url,
    branch: "",
    booking_via: "whatsapp_to_crm",
    booking_created_date_and_time: localDateTimeNow(),
  };
}
