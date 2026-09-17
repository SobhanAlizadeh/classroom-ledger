const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "2-digit", month: "2-digit", year: "numeric" });
export function formatJalali(date: Date | string) { return formatter.format(typeof date === "string" ? new Date(`${date}T12:00:00`) : date); }
export function formatJalaliShort(date: Date | string) { return shortFormatter.format(typeof date === "string" ? new Date(`${date}T12:00:00`) : date); }
export function formatGregorianInput(date: string) { return formatJalaliShort(date); }
