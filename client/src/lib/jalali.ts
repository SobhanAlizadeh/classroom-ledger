const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "2-digit", month: "2-digit", year: "numeric" });
export function formatJalali(date: Date | string) { return formatter.format(typeof date === "string" ? new Date(`${date}T12:00:00`) : date); }
export function formatJalaliShort(date: Date | string) { return shortFormatter.format(typeof date === "string" ? new Date(`${date}T12:00:00`) : date); }
export function formatGregorianInput(date: string) { return formatJalaliShort(date); }

const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
export { monthNames };
export function toJalaliParts(value: string) {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", { year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date(`${value}T12:00:00`));
  return { year: Number(parts.find(p => p.type === "year")?.value), month: Number(parts.find(p => p.type === "month")?.value), day: Number(parts.find(p => p.type === "day")?.value) };
}
export function jalaliDaysInMonth(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  const next = new Date(`${year + 1}-03-20T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US-u-ca-persian", { month: "numeric", day: "numeric" }).format(next).includes("1") ? 30 : 29;
}
export function jalaliToGregorian(year: number, month: number, day: number) {
  const approx = new Date(Date.UTC(year + 621, month <= 10 ? month - 1 : month, day, 12));
  for (let offset = -5; offset <= 5; offset++) {
    const candidate = new Date(approx.getTime() + offset * 86400000);
    const parts = toJalaliParts(candidate.toISOString().slice(0, 10));
    if (parts.year === year && parts.month === month && parts.day === day) return candidate.toISOString().slice(0, 10);
  }
  return approx.toISOString().slice(0, 10);
}
