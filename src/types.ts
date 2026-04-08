export type ThemeKey = "blue" | "teal" | "amber" | "rose" | "slate";

export interface Theme {
  main: string;
  dark: string;
  light: string;
}

export interface MonthPalette {
  main: string;
  dark: string;
  light: string;
  surface: string;
  ink: string;
  accent: string;
  glow: string;
}

export interface MonthStyle {
  destination: string;
  country: string;
  season: string;
  palette: MonthPalette;
  heroSrc: string;
  heroPosition: string;
}

export interface DatePoint {
  y: number;
  m: number;
  d: number;
}

export interface NotesStore {
  [key: string]: string[];
}

export type NoteMarker = "single" | "range" | "mixed" | null;

export interface DayPreview {
  hasSingle: boolean;
  hasRange: boolean;
  preview: string[];
  totalCount: number;
}

export interface CalendarCell {
  key: string;
  day: number;
  date: DatePoint;
  isOtherMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export type FlipStage = "next" | "prev" | "animating" | null;

export interface StaticMonthSnapshot {
  year: number;
  month: number;
  monthStyle: MonthStyle;
  holidays: Record<number, string>;
  weeks: CalendarCell[][];
  monthNotesCount: number;
  dayPreviews: Map<number, DayPreview>;
}

export interface NotesListItem {
  key: string;
  notes: string[];
}

export const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

export const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const HOLIDAYS: Record<string, string> = {
  "2026-1-1": "New Year's Day",
  "2026-1-26": "Republic Day",
  "2026-3-14": "Holi",
  "2026-4-14": "Dr. Ambedkar Jayanti",
  "2026-5-1": "Labour Day",
  "2026-8-15": "Independence Day",
  "2026-10-2": "Gandhi Jayanti",
  "2026-10-20": "Dussehra",
  "2026-11-5": "Diwali",
  "2026-12-25": "Christmas Day",
};

