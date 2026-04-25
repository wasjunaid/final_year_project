export function toNullableString(v?: string | null): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export function toBool(v: any): boolean {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === '1') return true;
  if (v === 0 || v === '0') return false;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return false;
}

export function toNumberOrNull(v?: string | number | null): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

export function normalizeDateTime(date?: string | null, time?: string | null) {
  const dRaw = toNullableString(date);
  const tRaw = toNullableString(time);

  const toLocalDateYmd = (value: string): string | null => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // If the incoming date already contains a time part (ISO or similar),
  // avoid converting it to UTC with toISOString() because that changes
  // the visible time (it was showing as 19:00 due to timezone conversion).
  // Prefer keeping the original representation and extracting the time
  // substring so the UI shows the same time the backend provided.
  if (dRaw && dRaw.includes('T')) {
    const [datePartRaw, timePartRaw] = dRaw.split('T');
    const datePart = toLocalDateYmd(dRaw) ?? datePartRaw ?? null;
    const timeFromDRaw = timePartRaw ? timePartRaw.slice(0, 8) : null;
    // If an explicit time field (tRaw) was provided, prefer it for display
    // because some backends send a scheduledAt UTC string in `date` and a
    // separate local time in `time`. Use the DTO's `time` for the UI column
    // while keeping scheduledAt as the original ISO for reference.
    const timePart = tRaw ? (tRaw.length === 5 ? `${tRaw}:00` : tRaw.slice(0, 8)) : timeFromDRaw;
    return { scheduledAt: dRaw, date: datePart ?? null, time: timePart ?? null };
  }

  if (dRaw && tRaw) {
    const timePart = tRaw.length === 5 ? `${tRaw}:00` : tRaw.slice(0, 8);
    const scheduledAt = `${dRaw}T${timePart}Z`;
    return { scheduledAt, date: dRaw, time: timePart };
  }

  if (dRaw) {
    const scheduledAt = `${dRaw}T00:00:00Z`;
    return { scheduledAt, date: dRaw, time: null };
  }

  if (tRaw) {
    const timePart = tRaw.length === 5 ? `${tRaw}:00` : tRaw.slice(0, 8);
    return { scheduledAt: null, date: null, time: timePart };
  }

  return { scheduledAt: null, date: null, time: null };
}
