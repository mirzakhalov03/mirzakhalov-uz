const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** '2026-03' → 'Mar 2026'; '2023' → '2023'. Not Intl: the input is a partial
 *  date, and `new Date('2023')` is a UTC instant that can render as 2022 west
 *  of Greenwich. */
export function formatPartialDate(value: string): string {
  const [year, month] = value.split('-');
  if (!year) return value;
  if (!month) return year;

  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : year;
}
