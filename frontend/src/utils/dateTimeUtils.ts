/**
 * Utility functions for robust date-time conversions between
 * HTML5 <input type="datetime-local">, backend UTC ISO-8601 strings,
 * and user-friendly localized displays.
 */

/**
 * Converts any UTC ISO string or timestamp from the backend into
 * "YYYY-MM-DDTHH:mm" format in the user's LOCAL browser timezone,
 * suitable for populating <input type="datetime-local" />.
 */
export const toLocalDatetimeInput = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Converts a datetime-local input string ("YYYY-MM-DDTHH:mm") into a
 * true UTC ISO-8601 string (e.g. "2026-09-25T10:00:00.000Z") for API payloads.
 * Prevents UTC-offset drift between client and backend.
 */
export const toUtcIsoString = (inputVal?: string | null): string => {
  if (!inputVal) return '';

  // If already an ISO string with UTC 'Z' or timezone offset (+05:30 / -04:00)
  if (inputVal.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(inputVal)) {
    const d = new Date(inputVal);
    return isNaN(d.getTime()) ? inputVal : d.toISOString();
  }

  // Parse naive "YYYY-MM-DDTHH:mm" as local time
  const d = new Date(inputVal);
  if (isNaN(d.getTime())) return inputVal;

  return d.toISOString();
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a date string into a strict "Date Mon Year" representation
 * (e.g. "25 Sep 2026").
 */
export const formatDisplayDate = (dateStr?: string | Date | number | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Formats a date string into a friendly localized 12-hour time representation
 * (e.g. "10:30 AM").
 */
export const formatDisplayTime = (
  dateStr?: string | Date | number | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString(
    [],
    options || {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
  );
};

/**
 * Formats a date string into "Date Mon Year, Time" representation
 * (e.g. "25 Sep 2026, 10:30 AM").
 */
export const formatDisplayDateTime = (dateStr?: string | Date | number | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const datePart = formatDisplayDate(dateStr);
  const timePart = formatDisplayTime(dateStr);

  return `${datePart}, ${timePart}`;
};
