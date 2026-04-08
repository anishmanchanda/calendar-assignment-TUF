"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarWeek,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faKeyboard,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import "./WallCalendar.css";

type ThemeKey = "blue" | "teal" | "amber" | "rose" | "slate";

interface Theme {
  main: string;
  dark: string;
  light: string;
}

interface MonthPalette {
  main: string;
  dark: string;
  light: string;
  surface: string;
  ink: string;
  accent: string;
  glow: string;
}

interface MonthStyle {
  destination: string;
  country: string;
  season: string;
  palette: MonthPalette;
  heroSrc: string;
  heroPosition: string;
}

interface DatePoint {
  y: number;
  m: number;
  d: number;
}

interface NotesStore {
  [key: string]: string[];
}

type NoteMarker = "single" | "range" | "mixed" | null;

interface DayPreview {
  hasSingle: boolean;
  hasRange: boolean;
  preview: string[];
  totalCount: number;
}

interface CalendarCell {
  key: string;
  day: number;
  date: DatePoint;
  isOtherMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

type FlipStage = "next" | "prev" | null;

const MONTHS = [
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

const SHORT_MONTHS = [
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

const HOLIDAYS: Record<string, string> = {
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

const THEMES: Record<ThemeKey, Theme> = {
  blue: { main: "#1a85d6", dark: "#0e5fa0", light: "#e8f4fd" },
  teal: { main: "#0d9488", dark: "#0f766e", light: "#d1fae5" },
  amber: { main: "#d97706", dark: "#b45309", light: "#fef3c7" },
  rose: { main: "#e11d48", dark: "#9f1239", light: "#ffe4e6" },
  slate: { main: "#475569", dark: "#1e293b", light: "#f1f5f9" },
};

const MONTH_STYLES: MonthStyle[] = [
  {
    destination: "Zermatt",
    country: "Switzerland",
    season: "Peak ski season",
    heroSrc: "/heroes/01-january-zermatt.jpg",
    heroPosition: "center 58%",
    palette: {
      main: "#5678c7",
      dark: "#1f326f",
      light: "#e9efff",
      surface: "#f6f8ff",
      ink: "#10214a",
      accent: "#ffd78b",
      glow: "#b8ccff",
    },
  },
  {
    destination: "Kyoto",
    country: "Japan",
    season: "Plum blossom season",
    heroSrc: "/heroes/02-february-kyoto.jpg",
    heroPosition: "center 34%",
    palette: {
      main: "#2f7a6d",
      dark: "#173f3b",
      light: "#e4f7f3",
      surface: "#f3fbf8",
      ink: "#123330",
      accent: "#f7c46a",
      glow: "#8de0cc",
    },
  },
  {
    destination: "Amsterdam",
    country: "Netherlands",
    season: "Tulip season",
    heroSrc: "/heroes/03-march-amsterdam.jpg",
    heroPosition: "center 56%",
    palette: {
      main: "#d66543",
      dark: "#7f2d1b",
      light: "#fff0ea",
      surface: "#fff7f3",
      ink: "#52251c",
      accent: "#f6d365",
      glow: "#ffb18d",
    },
  },
  {
    destination: "Istanbul",
    country: "Turkey",
    season: "Spring city break",
    heroSrc: "/heroes/04-april-istanbul.jpg",
    heroPosition: "center 45%",
    palette: {
      main: "#3e7fb0",
      dark: "#1e4463",
      light: "#e5f3ff",
      surface: "#f2f8fd",
      ink: "#16334b",
      accent: "#9fe1ff",
      glow: "#9fc4ff",
    },
  },
  {
    destination: "Santorini",
    country: "Greece",
    season: "Shoulder-season coast",
    heroSrc: "/heroes/05-may-santorini.jpg",
    heroPosition: "center 42%",
    palette: {
      main: "#9b7a28",
      dark: "#57430e",
      light: "#fff6da",
      surface: "#fffbf0",
      ink: "#45350d",
      accent: "#ffdf78",
      glow: "#f5cb5c",
    },
  },
  {
    destination: "Bali",
    country: "Indonesia",
    season: "Dry season surf",
    heroSrc: "/heroes/06-june-bali.jpg",
    heroPosition: "center 54%",
    palette: {
      main: "#14807b",
      dark: "#0c4845",
      light: "#dcfbf7",
      surface: "#effbf9",
      ink: "#0f3532",
      accent: "#ffc57a",
      glow: "#91e6d9",
    },
  },
  {
    destination: "Interlaken",
    country: "Switzerland",
    season: "Alpine summer",
    heroSrc: "/heroes/07-july-interlaken.jpg",
    heroPosition: "center 58%",
    palette: {
      main: "#cb6a3c",
      dark: "#6d3119",
      light: "#fff0e9",
      surface: "#fff7f3",
      ink: "#4c2415",
      accent: "#ffd166",
      glow: "#ffb38f",
    },
  },
  {
    destination: "Reykjavik",
    country: "Iceland",
    season: "Late-summer road trip",
    heroSrc: "/heroes/08-august-reykjavik.jpg",
    heroPosition: "center 42%",
    palette: {
      main: "#437e73",
      dark: "#20453f",
      light: "#e6f8f3",
      surface: "#f2fbf8",
      ink: "#1a3933",
      accent: "#f9d27d",
      glow: "#9dd8c8",
    },
  },
  {
    destination: "Tuscany",
    country: "Italy",
    season: "Harvest countryside",
    heroSrc: "/heroes/09-september-tuscany.jpg",
    heroPosition: "center 56%",
    palette: {
      main: "#7a5dc7",
      dark: "#3b2d6f",
      light: "#efe9ff",
      surface: "#f7f4ff",
      ink: "#292042",
      accent: "#f6b26b",
      glow: "#c5b3ff",
    },
  },
  {
    destination: "Marrakech",
    country: "Morocco",
    season: "Cool desert evenings",
    heroSrc: "/heroes/10-october-marrakech.jpg",
    heroPosition: "center 46%",
    palette: {
      main: "#b55d31",
      dark: "#653219",
      light: "#ffede5",
      surface: "#fff6f1",
      ink: "#492414",
      accent: "#ffcf7f",
      glow: "#ffb089",
    },
  },
  {
    destination: "New York",
    country: "USA",
    season: "Crisp city autumn",
    heroSrc: "/heroes/11-november-new-york.jpg",
    heroPosition: "center 52%",
    palette: {
      main: "#6c4fa3",
      dark: "#38265a",
      light: "#f0e8ff",
      surface: "#f8f4ff",
      ink: "#2f2145",
      accent: "#ffd186",
      glow: "#b79df7",
    },
  },
  {
    destination: "Lapland",
    country: "Finland",
    season: "Snow and aurora",
    heroSrc: "/heroes/12-december-lapland.jpg",
    heroPosition: "center 48%",
    palette: {
      main: "#2e6b5c",
      dark: "#183b34",
      light: "#e5f6f1",
      surface: "#f2fbf8",
      ink: "#17322e",
      accent: "#ffd48a",
      glow: "#8bcdb6",
    },
  },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) - Math.round(amount * 255)));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) - Math.round(amount * 255)));
  const b = Math.max(0, Math.min(255, (n & 0xff) - Math.round(amount * 255)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function toComparable(dt: DatePoint): number {
  return dt.y * 10000 + dt.m * 100 + dt.d;
}

function toDatePoint(date: Date): DatePoint {
  return { y: date.getFullYear(), m: date.getMonth(), d: date.getDate() };
}

function formatDate(dt: DatePoint | null): string {
  if (!dt) return "";
  return `${SHORT_MONTHS[dt.m]} ${dt.d}`;
}

function formatLongDate(dt: DatePoint): string {
  return `${SHORT_MONTHS[dt.m]} ${dt.d}, ${dt.y}`;
}

function clampDay(year: number, month: number, day: number): number {
  return Math.max(1, Math.min(day, new Date(year, month + 1, 0).getDate()));
}

function daysBetween(a: DatePoint, b: DatePoint): number {
  const d1 = new Date(a.y, a.m, a.d);
  const d2 = new Date(b.y, b.m, b.d);
  return Math.abs(Math.round((d2.getTime() - d1.getTime()) / 86400000)) + 1;
}

function getHolidaysForMonth(year: number, month: number): Record<number, string> {
  const result: Record<number, string> = {};
  Object.entries(HOLIDAYS).forEach(([key, name]) => {
    const [y, m, d] = key.split("-").map(Number);
    if (y === year && m === month + 1) result[d] = name;
  });
  return result;
}

function getISOWeekNumber(date: Date): number {
  const working = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = working.getUTCDay() || 7;
  working.setUTCDate(working.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(working.getUTCFullYear(), 0, 1));
  return Math.ceil((((working.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

const LS_KEY = "wc-notes";
const FLIP_OUT_MS = 400;
const FLIP_IN_MS = 380;
const HERO_CROSSFADE_MS = 400;

function dateKey(dt: DatePoint): string {
  return `${dt.y}-${dt.m + 1}-${dt.d}`;
}

function rangeNoteKey(start: DatePoint, end: DatePoint | null): string {
  if (!end) return dateKey(start);
  const s = toComparable(start) <= toComparable(end) ? start : end;
  const e = toComparable(start) <= toComparable(end) ? end : start;
  return `${dateKey(s)}__${dateKey(e)}`;
}

function loadNotes(): NotesStore {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveNotes(store: NotesStore) {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

function getLabelForStoredKey(key: string): string {
  const single = key.match(/^(\d+)-(\d+)-(\d+)$/);
  if (single) {
    const [, y, m, d] = single.map(Number);
    return `${SHORT_MONTHS[m - 1]} ${d}, ${y}`;
  }

  const range = key.match(/^(\d+)-(\d+)-(\d+)__(\d+)-(\d+)-(\d+)$/);
  if (range) {
    const [, sy, sm, sd, ey, em, ed] = range.map(Number);
    return `${SHORT_MONTHS[sm - 1]} ${sd}, ${sy} - ${SHORT_MONTHS[em - 1]} ${ed}, ${ey}`;
  }

  return key.replace(/-/g, "/");
}

function upsertDayPreview(map: Map<number, DayPreview>, day: number, type: "single" | "range", notes: string[]) {
  const existing = map.get(day) ?? { hasSingle: false, hasRange: false, preview: [], totalCount: 0 };
  if (type === "single") existing.hasSingle = true;
  if (type === "range") existing.hasRange = true;
  existing.totalCount += notes.length;
  existing.preview = [...existing.preview, ...notes].slice(0, 3);
  map.set(day, existing);
}

function getDayPreviewForMonth(notes: NotesStore, year: number, month: number, daysInMonth: number) {
  const previews = new Map<number, DayPreview>();

  Object.entries(notes).forEach(([key, values]) => {
    const cleanNotes = values.map((value) => value.trim()).filter(Boolean);
    if (!cleanNotes.length) return;

    const single = key.match(/^(\d+)-(\d+)-(\d+)$/);
    if (single) {
      const [, y, m, d] = single.map(Number);
      if (y === year && m === month + 1 && d <= daysInMonth) {
        upsertDayPreview(previews, d, "single", cleanNotes);
      }
      return;
    }

    const range = key.match(/^(\d+)-(\d+)-(\d+)__(\d+)-(\d+)-(\d+)$/);
    if (!range) return;

    const [, sy, sm, sd, ey, em, ed] = range.map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    for (let day = 1; day <= daysInMonth; day += 1) {
      const current = new Date(year, month, day);
      if (current >= start && current <= end) {
        upsertDayPreview(previews, day, "range", cleanNotes);
      }
    }
  });

  return previews;
}

function getMarkerType(preview: DayPreview | undefined): NoteMarker {
  if (!preview) return null;
  if (preview.hasSingle && preview.hasRange) return "mixed";
  if (preview.hasSingle) return "single";
  if (preview.hasRange) return "range";
  return null;
}

interface StaticMonthSnapshot {
  year: number;
  month: number;
  monthStyle: MonthStyle;
  holidays: Record<number, string>;
  weeks: CalendarCell[][];
  monthNotesCount: number;
  dayPreviews: Map<number, DayPreview>;
}

function buildCalendarWeeks(year: number, month: number, today: Date): CalendarCell[][] {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const totalCells = startOffset + daysInMonth;
  const trailingDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startOffset; i += 1) {
    const date = new Date(year, month - 1, prevMonthDays - startOffset + 1 + i);
    cells.push({
      key: `prev-${year}-${month}-${i}`,
      day: date.getDate(),
      date: toDatePoint(date),
      isOtherMonth: true,
      isToday: false,
      isWeekend: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    cells.push({
      key: `${year}-${month}-${day}`,
      day,
      date: { y: year, m: month, d: day },
      isOtherMonth: false,
      isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === day,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  for (let i = 0; i < trailingDays; i += 1) {
    const date = new Date(year, month + 1, i + 1);
    cells.push({
      key: `next-${year}-${month}-${i}`,
      day: date.getDate(),
      date: toDatePoint(date),
      isOtherMonth: true,
      isToday: false,
      isWeekend: false,
    });
  }

  return chunk(cells, 7);
}

function buildStaticMonthSnapshot(viewDate: Date, today: Date, notes: NotesStore): StaticMonthSnapshot {
  console.log(`[Debug] Building static underlay snapshot for ${viewDate.getFullYear()}-${viewDate.getMonth() + 1}`);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return {
    year,
    month,
    monthStyle: MONTH_STYLES[month],
    holidays: getHolidaysForMonth(year, month),
    weeks: buildCalendarWeeks(year, month, today),
    monthNotesCount: Object.entries(notes).filter(([key, values]) => {
      if (!values.some((value) => value.trim())) return false;

      const single = key.match(/^(\d+)-(\d+)-(\d+)$/);
      if (single) {
        const [, y, m] = single.map(Number);
        return y === year && m === month + 1;
      }

      const range = key.match(/^(\d+)-(\d+)-(\d+)__(\d+)-(\d+)-(\d+)$/);
      if (!range) return false;

      const [, sy, sm, , ey, em] = range.map(Number);
      return (sy === year && sm === month + 1) || (ey === year && em === month + 1);
    }).length,
    dayPreviews: getDayPreviewForMonth(notes, year, month, daysInMonth),
  };
}

function SpiralBinding() {
  const coils = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="wc-spiral-bar" aria-hidden="true">
      <div className="wc-nail-hook" />
      {coils.map((i) => (
        <div key={i} className="wc-coil" />
      ))}
    </div>
  );
}

interface NotesListItem {
  key: string;
  notes: string[];
}

interface NotesListProps {
  items: NotesListItem[];
  onDeleteGroup: (key: string) => void;
  onDeleteNote: (key: string, noteIndex: number) => void;
}

function NotesList({ items, onDeleteGroup, onDeleteNote }: NotesListProps) {
  if (items.length === 0) return <p className="wc-nl-empty">No saved notes in this month yet.</p>;

  return (
    <div className="wc-nl-scroll">
      {items.map(({ key, notes }) => (
        <div key={key} className="wc-nl-group">
          <div className={`wc-nl-group-header ${key.includes("__") ? "wc-nl-group-header--range" : "wc-nl-group-header--single"}`}>
            <span className="wc-nl-dot" />
            <span className="wc-nl-group-label">{getLabelForStoredKey(key)}</span>
            <button
              className="wc-nl-del-group"
              onClick={() => onDeleteGroup(key)}
              title="Delete all notes for this selection"
              type="button"
            >
              Delete
            </button>
          </div>
          {notes.map((note, index) => (
            <div key={`${key}-${index}`} className="wc-nl-item">
              <span className="wc-nl-item-text">{note}</span>
              <button
                className="wc-nl-del-note"
                onClick={() => onDeleteNote(key, index)}
                title="Delete note"
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

interface DayCellProps {
  day: number;
  ariaLabel: string;
  isStatic?: boolean;
  isOtherMonth?: boolean;
  isToday?: boolean;
  isWeekend?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
  inRange?: boolean;
  hasHoliday?: boolean;
  holidayLabel?: string;
  noteType?: NoteMarker;
  previewNotes?: string[];
  previewCount?: number;
  showPreview?: boolean;
  isFocused?: boolean;
  buttonRef?: (node: HTMLButtonElement | null) => void;
  onClick?: (day: number, event: ReactMouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (day: number) => void;
  onMouseLeave?: (day: number) => void;
  onFocus?: (day: number) => void;
  onBlur?: (day: number) => void;
  onKeyDown?: (day: number, event: KeyboardEvent<HTMLButtonElement>) => void;
}

const DayCell = memo(function DayCell({
  day,
  ariaLabel,
  isStatic,
  isOtherMonth,
  isToday,
  isWeekend,
  isStart,
  isEnd,
  inRange,
  hasHoliday,
  holidayLabel,
  noteType,
  previewNotes = [],
  previewCount = 0,
  showPreview,
  isFocused,
  buttonRef,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
}: DayCellProps) {
  const classes = [
    "wc-day",
    isStatic ? "wc-day--static" : "",
    isOtherMonth ? "wc-day--other" : "",
    isToday ? "wc-day--today" : "",
    isWeekend ? "wc-day--weekend" : "",
    isStart ? "wc-day--start" : "",
    isEnd ? "wc-day--end" : "",
    inRange && !isStart && !isEnd ? "wc-day--range" : "",
    hasHoliday ? "wc-day--holiday" : "",
    noteType === "single" ? "wc-day--note-single" : "",
    noteType === "range" ? "wc-day--note-range" : "",
    noteType === "mixed" ? "wc-day--note-mixed" : "",
    isFocused ? "wc-day--focused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {isToday && <span className="wc-day-pulse" aria-hidden="true" />}
      <span className="wc-day-label">{day}</span>
      {hasHoliday && <span className="wc-day-holiday-dot" aria-label={holidayLabel} />}
      {noteType && <span className={`wc-day-note-dot wc-day-note-dot--${noteType}`} aria-hidden="true" />}
      {showPreview && previewNotes.length > 0 && (
        <span className="wc-day-preview" role="note">
          <span className="wc-day-preview-title">Notes</span>
          {previewNotes.map((note, index) => (
            <span key={`${note}-${index}`} className="wc-day-preview-line">
              {note}
            </span>
          ))}
          {previewCount > previewNotes.length && (
            <span className="wc-day-preview-more">+{previewCount - previewNotes.length} more</span>
          )}
        </span>
      )}
    </>
  );

  if (isStatic) {
    return (
      <div className={classes} aria-hidden="true">
        {content}
      </div>
    );
  }

  return (
    <button
      ref={buttonRef}
      className={classes}
      onClick={(e) => onClick?.(day, e)}
      onMouseEnter={() => onMouseEnter?.(day)}
      onMouseLeave={() => onMouseLeave?.(day)}
      onFocus={() => onFocus?.(day)}
      onBlur={() => onBlur?.(day)}
      onKeyDown={(e) => onKeyDown?.(day, e)}
      disabled={isOtherMonth}
      type="button"
      tabIndex={isOtherMonth ? -1 : isFocused ? 0 : -1}
      aria-current={isToday ? "date" : undefined}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
});

export interface WallCalendarProps {
  initialMonth?: number;
  initialYear?: number;
  initialTheme?: ThemeKey;
  onRangeChange?: (start: DatePoint | null, end: DatePoint | null) => void;
}

export default function WallCalendar({
  initialMonth,
  initialYear,
  initialTheme = "blue",
  onRangeChange,
}: WallCalendarProps) {
  const today = new Date();
  const initialViewDate = new Date(initialYear ?? today.getFullYear(), initialMonth ?? today.getMonth(), 1);
  const [viewDate, setViewDate] = useState(initialViewDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthStyle = MONTH_STYLES[month];
  const fallbackTheme = THEMES[initialTheme];
  const palette = monthStyle?.palette ?? {
    main: fallbackTheme.main,
    dark: fallbackTheme.dark,
    light: fallbackTheme.light,
    surface: "#f8fbff",
    ink: "#102142",
    accent: "#ffd78b",
    glow: "#b8ccff",
  };

  const initialFocusedDay =
    today.getFullYear() === year && today.getMonth() === month ? today.getDate() : 1;

  const [focusedDay, setFocusedDay] = useState(initialFocusedDay);
  const [previewDay, setPreviewDay] = useState<number | null>(null);
  const [showWeekNumbers, setShowWeekNumbers] = useState(true);
  const [rangeStart, setRangeStart] = useState<DatePoint | null>(null);
  const [rangeEnd, setRangeEnd] = useState<DatePoint | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [notes, setNotes] = useState<NotesStore>(loadNotes);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<"year" | "month" | null>(null);
  const [pickerPos, setPickerPos] = useState({ top: 0, right: 0 });
  const [flipStage, setFlipStage] = useState<FlipStage>(null);
  const [flipTargetDate, setFlipTargetDate] = useState<Date | null>(null);
  const [notesOpen, setNotesOpen] = useState(true);
  const [heroPrevious, setHeroPrevious] = useState<{ src: string; position: string } | null>(null);
  const [heroCrossfading, setHeroCrossfading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const activeDayButtonRef = useRef<HTMLButtonElement | null>(null);
  const flipAudio = useRef<HTMLAudioElement | null>(null);
  const heroStateRef = useRef({ src: monthStyle.heroSrc, position: monthStyle.heroPosition });
  const skipHeroCrossfadeRef = useRef(false);

  useEffect(() => {
    flipAudio.current = new Audio("/flip.mp3");
  }, []);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (event: globalThis.MouseEvent) => {
      const popover = document.getElementById("wc-picker-portal");
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node) &&
        popover &&
        !popover.contains(event.target as Node)
      ) {
        setPickerOpen(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  useEffect(() => {
    onRangeChange?.(rangeStart, rangeEnd);
  }, [rangeStart, rangeEnd, onRangeChange]);

  useEffect(() => {
    activeDayButtonRef.current?.focus();
  }, [year, month, focusedDay]);

  useEffect(() => {
    const currentHero = monthStyle.heroSrc;
    if (heroStateRef.current.src === currentHero) return;

    if (skipHeroCrossfadeRef.current) {
      heroStateRef.current = { src: currentHero, position: monthStyle.heroPosition };
      skipHeroCrossfadeRef.current = false;
      window.setTimeout(() => {
        setHeroPrevious(null);
        setHeroCrossfading(false);
      }, 0);
      return;
    }

    setHeroPrevious(heroStateRef.current);
    setHeroCrossfading(true);
    heroStateRef.current = { src: currentHero, position: monthStyle.heroPosition };

    const timer = window.setTimeout(() => {
      setHeroCrossfading(false);
      setHeroPrevious(null);
    }, HERO_CROSSFADE_MS);

    return () => window.clearTimeout(timer);
  }, [monthStyle.heroPosition, monthStyle.heroSrc]);

  useEffect(() => {
    MONTH_STYLES.forEach(({ heroSrc }) => {
      const image = new Image();
      image.decoding = "async";
      image.src = heroSrc;
      void image.decode?.().catch(() => {});
    });
  }, []);

  const openPicker = (type: "year" | "month") => {
    if (overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      setPickerPos({ top: rect.bottom + window.scrollY + 8, right: window.innerWidth - rect.right });
    }
    setPickerOpen((current) => (current === type ? null : type));
  };

  const triggerFlip = useCallback((dir: "next" | "prev", nextDate: Date, callback: () => void) => {
    if (flipStage) {
      console.log("[Debug] Flip already in progress, aborting triggerFlip");
      return;
    }

    console.log(`[Debug] Triggering flip. Dir: ${dir}, targetDate:`, nextDate);

    if (flipAudio.current) {
      flipAudio.current.currentTime = 0;
      flipAudio.current.play().catch(() => {});
    }
    skipHeroCrossfadeRef.current = true;
    if (dir === "next") {
      setFlipTargetDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
      setFlipStage("next");
      window.setTimeout(() => {
        console.log(`[Debug] Executing callback for 'next' flip (after ${FLIP_OUT_MS}ms)`);
        callback();
        setFlipStage(null);
        setFlipTargetDate(null);
      }, FLIP_OUT_MS);
      return;
    }

    const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    setFlipTargetDate(currentDate);
    console.log("[Debug] Executing callback immediately for 'prev' flip");
    callback();
    setFlipStage("prev");
    window.setTimeout(() => {
      console.log(`[Debug] Cleaning up 'prev' flip (after ${FLIP_IN_MS}ms)`);
      setFlipStage(null);
      setFlipTargetDate(null);
    }, FLIP_IN_MS);
  }, [flipStage, viewDate]);

  const goToMonth = useCallback(
    (next: Date, dir: "next" | "prev", focusDayOverride?: number) => {
      console.log(`[Debug] goToMonth called. Next: ${next.getFullYear()}-${next.getMonth() + 1}, Dir: ${dir}`);
      triggerFlip(dir, next, () => {
        console.log("[Debug] Updating states: viewDate, focusedDay");
        setViewDate(new Date(next.getFullYear(), next.getMonth(), 1));
        setFocusedDay(clampDay(next.getFullYear(), next.getMonth(), focusDayOverride ?? focusedDay));
      });
    },
    [focusedDay, triggerFlip],
  );

  const prevMonth = useCallback(() => {
    goToMonth(new Date(year, month - 1, 1), "prev", focusedDay);
  }, [focusedDay, goToMonth, month, year]);

  const nextMonth = useCallback(() => {
    goToMonth(new Date(year, month + 1, 1), "next", focusedDay);
  }, [focusedDay, goToMonth, month, year]);

  const startSelection = useCallback((point: DatePoint) => {
    setRangeStart(point);
    setRangeEnd(null);
    setSelecting(true);
    setShowAllNotes(false);
    setNotesOpen(true);
  }, []);

  const completeSelection = useCallback((point: DatePoint) => {
    setRangeEnd(point);
    setSelecting(false);
    setShowAllNotes(false);
    setNotesOpen(true);
  }, []);

  const handleDayClick = useCallback(
    (day: number, extendRange = false) => {
      const point = { y: year, m: month, d: day };
      setFocusedDay(day);

      if (extendRange && rangeStart) {
        completeSelection(point);
        return;
      }

      if (!selecting || !rangeStart || rangeEnd) {
        startSelection(point);
        return;
      }

      completeSelection(point);
    },
    [completeSelection, month, rangeEnd, rangeStart, selecting, startSelection, year],
  );

  const clearSelection = useCallback(() => {
    setRangeStart(null);
    setRangeEnd(null);
    setSelecting(false);
  }, []);

  const activeKey = rangeStart ? rangeNoteKey(rangeStart, rangeEnd) : null;
  const currentNotes = activeKey ? notes[activeKey] ?? [""] : [];

  const updateNote = (index: number, value: string) => {
    if (!activeKey) return;
    setNotes((previous) => {
      const current = [...(previous[activeKey] ?? [""])];
      current[index] = value;
      const trimmed = current.some((item) => item.trim()) ? current : [];
      const next = { ...previous };

      if (trimmed.length) next[activeKey] = current;
      else delete next[activeKey];

      saveNotes(next);
      return next;
    });
  };

  const addNote = () => {
    if (!activeKey) return;
    setNotes((previous) => {
      const next = { ...previous, [activeKey]: [...(previous[activeKey] ?? [""]), ""] };
      saveNotes(next);
      return next;
    });
  };

  const deleteNoteGroup = (key: string) => {
    setNotes((previous) => {
      const next = { ...previous };
      delete next[key];
      saveNotes(next);
      return next;
    });
  };

  const deleteNoteItem = (key: string, index: number) => {
    setNotes((previous) => {
      const nextNotes = (previous[key] ?? []).filter((_, noteIndex) => noteIndex !== index);
      const next = { ...previous };

      if (nextNotes.length) next[key] = nextNotes;
      else delete next[key];

      saveNotes(next);
      return next;
    });
  };

  const holidays = useMemo(() => getHolidaysForMonth(year, month), [year, month]);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const prevMonthDays = new Date(year, month, 0).getDate();
  const totalCells = startOffset + daysInMonth;
  const trailingDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const dayPreviews = useMemo(() => getDayPreviewForMonth(notes, year, month, daysInMonth), [notes, year, month, daysInMonth]);

  const cells: CalendarCell[] = useMemo(() => {
    const list: CalendarCell[] = [];

    for (let i = 0; i < startOffset; i += 1) {
      const date = new Date(year, month - 1, prevMonthDays - startOffset + 1 + i);
      list.push({
        key: `prev-${i}`,
        day: date.getDate(),
        date: toDatePoint(date),
        isOtherMonth: true,
        isToday: false,
        isWeekend: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      list.push({
        key: `${year}-${month}-${day}`,
        day,
        date: { y: year, m: month, d: day },
        isOtherMonth: false,
        isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === day,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    for (let i = 0; i < trailingDays; i += 1) {
      const date = new Date(year, month + 1, i + 1);
      list.push({
        key: `next-${i}`,
        day: date.getDate(),
        date: toDatePoint(date),
        isOtherMonth: true,
        isToday: false,
        isWeekend: false,
      });
    }

    return list;
  }, [year, month, startOffset, prevMonthDays, daysInMonth, trailingDays, today.getFullYear(), today.getMonth(), today.getDate()]);

  const weeks = useMemo(() => chunk(cells, 7), [cells]);

  const monthNotesList = useMemo(() => Object.entries(notes)
    .map(([key, values]) => ({ key, notes: values.map((value) => value.trim()).filter(Boolean) }))
    .filter(({ key, notes: savedNotes }) => {
      if (!savedNotes.length) return false;

      const single = key.match(/^(\d+)-(\d+)-(\d+)$/);
      if (single) {
        const [, y, m] = single.map(Number);
        return y === year && m === month + 1;
      }

      const range = key.match(/^(\d+)-(\d+)-(\d+)__(\d+)-(\d+)-(\d+)$/);
      if (!range) return false;

      const [, sy, sm, , ey, em] = range.map(Number);
      return (sy === year && sm === month + 1) || (ey === year && em === month + 1);
    }), [notes, year, month]);

  const rs = rangeStart ? toComparable(rangeStart) : null;
  const re = rangeEnd ? toComparable(rangeEnd) : null;
  const minR = rs !== null && re !== null ? Math.min(rs, re) : rs;
  const maxR = rs !== null && re !== null ? Math.max(rs, re) : rs;

  let selectionSummary = "";
  let notesRangeLabel = "";

  if (rangeStart && rangeEnd) {
    const start = toComparable(rangeStart) <= toComparable(rangeEnd) ? rangeStart : rangeEnd;
    const end = toComparable(rangeStart) <= toComparable(rangeEnd) ? rangeEnd : rangeStart;
    const totalDays = daysBetween(start, end);
    selectionSummary = `${formatDate(start)} - ${formatDate(end)} · ${totalDays} day${totalDays > 1 ? "s" : ""}`;
    notesRangeLabel = `${formatDate(start)} - ${formatDate(end)}`;
  } else if (rangeStart) {
    selectionSummary = `Focused: ${formatDate(rangeStart)}`;
    notesRangeLabel = formatDate(rangeStart);
  }

  const themeVars = {
    "--wc-main": palette.main,
    "--wc-dark": palette.dark,
    "--wc-light": palette.light,
    "--wc-surface": palette.surface,
    "--wc-ink": palette.ink,
    "--wc-glow": palette.glow,
    "--wc-accent": palette.accent,
    "--wc-range-bg": hexToRgba(palette.main, 0.12),
    "--wc-range-bd": hexToRgba(palette.main, 0.24),
    "--wc-hero-start": darken(palette.dark, 0.08),
    "--wc-hero-end": palette.main,
  } as CSSProperties;

  const moveFocus = useCallback((offset: number) => {
    setFocusedDay(currentDay => {
      const currentDate = new Date(year, month, currentDay);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + offset);

      if (nextDate.getFullYear() !== year || nextDate.getMonth() !== month) {
        goToMonth(nextDate, offset > 0 ? "next" : "prev", nextDate.getDate());
        return currentDay;
      }
      return nextDate.getDate();
    });
  }, [year, month, goToMonth]);

  const handleDayKeyDown = useCallback((day: number, event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveFocus(1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocus(7);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(-7);
        break;
      case "Home":
        event.preventDefault();
        setFocusedDay(1);
        break;
      case "End":
        event.preventDefault();
        setFocusedDay(daysInMonth);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleDayClick(day, event.shiftKey);
        break;
      default:
        break;
    }
  }, [moveFocus, setFocusedDay, daysInMonth, handleDayClick]);

  const handleDayMouseEnter = useCallback((day: number) => setPreviewDay(day), []);
  const handleDayMouseLeave = useCallback((day: number) => setPreviewDay(current => (current === day ? null : current)), []);
  const handleDayFocus = useCallback((day: number) => setPreviewDay(day), []);
  const handleDayBlur = useCallback((day: number) => setPreviewDay(current => (current === day ? null : current)), []);
  const handleDayClickWrapper = useCallback((day: number, event: ReactMouseEvent<HTMLButtonElement>) => handleDayClick(day, event.shiftKey), [handleDayClick]);
  const handleButtonRef = useCallback((node: HTMLButtonElement | null) => { activeDayButtonRef.current = node; }, []);

  const inlineHint = rangeStart
    ? selecting && !rangeEnd
      ? "Pick an end date or press Shift+Enter on the focused day."
      : "Hover a date to preview notes, press Enter to start a fresh selection."
    : "Hover a date to preview notes. Use arrow keys to move, Enter to select, Shift+Enter to set an end date.";

  const underlaySnapshot = flipTargetDate ? buildStaticMonthSnapshot(flipTargetDate, today, notes) : null;
  const frontCardFlipClass =
    flipStage === "next" ? " wc-card--flip-out-next" : flipStage === "prev" ? " wc-card--flip-in-prev" : "";

  console.log(`[Debug] Render: WallCalendar for ${year}-${month + 1}. FlipStage: ${flipStage}. HasUnderlay: ${!!flipTargetDate}`);

  const renderStaticCard = (snapshot: StaticMonthSnapshot) => {
    const holidayEntries = Object.entries(snapshot.holidays);

    return (
      <div className="wc-card wc-card--underlay" aria-hidden="true">
        <div className="wc-hero">
          <div
            className="wc-cover-wrap"
            style={{
              backgroundImage: `url("${snapshot.monthStyle.heroSrc}")`,
              backgroundPosition: snapshot.monthStyle.heroPosition,
            }}
          />

          <div className="wc-hero-overlay wc-hero-overlay--static">
            <span className="wc-season-tag">{snapshot.monthStyle.season}</span>
            <span className="wc-destination-name">{snapshot.monthStyle.destination}</span>
            <span className="wc-destination-meta">{snapshot.monthStyle.country}</span>
            <span className="wc-year">{snapshot.year}</span>
            <span className="wc-month">{MONTHS[snapshot.month]}</span>
            <div className="wc-nav-btns" style={{ opacity: 0, pointerEvents: 'none' }}>
              <button className="wc-nav-btn" type="button" aria-hidden="true" tabIndex={-1}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="wc-nav-btn" type="button" aria-hidden="true" tabIndex={-1}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        </div>

        <div className="wc-lower">
          <aside className="wc-notes wc-notes--static">
            <div className="wc-notes-header">
              <div className="wc-notes-collapse-btn" aria-hidden="true">
                <div>
                  <p className="wc-notes-label">Notes</p>
                  <p className="wc-notes-subtitle">Prepared month underneath the turning page</p>
                </div>
                <span className="wc-notes-chevron" style={{ opacity: 0 }}>
                  <FontAwesomeIcon icon={faChevronDown} />
                </span>
              </div>
              <span className="wc-notes-toggle">{`${snapshot.monthNotesCount} saved`}</span>
            </div>

            <div className="wc-notes-body wc-notes-body--open">
              <div className="wc-notes-editor wc-notes-editor--static">
                <p className="wc-notes-range">{`${SHORT_MONTHS[snapshot.month]} ${snapshot.year}`}</p>
                <p className="wc-empty-editor">
                  {snapshot.monthNotesCount
                    ? `${snapshot.monthNotesCount} saved note ${snapshot.monthNotesCount === 1 ? "entry is" : "entries are"} ready for this month.`
                    : "No saved notes for this month yet."}
                </p>
              </div>

              <div className="wc-holidays">
                <p className="wc-holidays-label">This month</p>
                {holidayEntries.length === 0 ? (
                  <p className="wc-no-holiday">No holidays</p>
                ) : (
                  holidayEntries.map(([day, name]) => (
                    <div key={day} className="wc-holiday-item">
                      <span className="wc-holiday-dot" />
                      <span>
                        <strong>{day}</strong> {name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          <div className="wc-grid-panel wc-grid-panel--static">
            <div className="wc-grid-topbar">
              <div className="wc-chip-row">
                {showWeekNumbers && <div className="wc-chip wc-chip--active">Week numbers</div>}
                <div className="wc-chip wc-chip--static">Month preloaded</div>
                <div className="wc-chip wc-chip--static">{`${holidayEntries.length} holiday${holidayEntries.length === 1 ? "" : "s"}`}</div>
              </div>
              <p className="wc-art-label">{snapshot.monthStyle.destination} travel pick</p>
            </div>

            <div className={`wc-weekdays${showWeekNumbers ? " wc-weekdays--with-weeks" : ""}`}>
              {showWeekNumbers && <div className="wc-weekday wc-weekday--weeknum">WK</div>}
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((dayName) => (
                <div
                  key={dayName}
                  className={`wc-weekday${dayName === "SAT" || dayName === "SUN" ? " wc-weekday--weekend" : ""}`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            <div className="wc-days">
              {snapshot.weeks.map((week, weekIndex) => (
                <div
                  key={`static-week-${snapshot.year}-${snapshot.month}-${weekIndex}`}
                  className={`wc-week-row${showWeekNumbers ? " wc-week-row--with-weeks" : ""}`}
                >
                  {showWeekNumbers && (
                    <div className="wc-week-number">
                      {getISOWeekNumber(new Date(week[0].date.y, week[0].date.m, week[0].date.d))}
                    </div>
                  )}

                  {week.map((cell) => {
                    const holidayLabel = !cell.isOtherMonth ? snapshot.holidays[cell.day] : undefined;
                    const preview = !cell.isOtherMonth ? snapshot.dayPreviews.get(cell.day) : undefined;

                    return (
                      <DayCell
                        key={`static-${cell.key}`}
                        day={cell.day}
                        ariaLabel=""
                        isStatic
                        isOtherMonth={cell.isOtherMonth}
                        isToday={cell.isToday}
                        isWeekend={cell.isWeekend}
                        hasHoliday={!cell.isOtherMonth && Boolean(holidayLabel)}
                        holidayLabel={holidayLabel}
                        noteType={!cell.isOtherMonth ? getMarkerType(preview) : null}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="wc-root" style={themeVars}>
      <SpiralBinding />

        <div className="wc-card-stack">
          {underlaySnapshot && renderStaticCard(underlaySnapshot)}
          <div className={`wc-card wc-card--front${frontCardFlipClass}`}>
          <div className="wc-hero">
            {heroPrevious && (
              <div
                className={`wc-cover-wrap wc-cover-wrap--previous${heroCrossfading ? " wc-cover-wrap--fading" : ""}`}
                style={{
                  backgroundImage: `url("${heroPrevious.src}")`,
                  backgroundPosition: heroPrevious.position,
                }}
                aria-hidden="true"
              />
            )}
            <div
              className={`wc-cover-wrap${heroCrossfading ? " wc-cover-wrap--current" : ""}`}
              style={{
                backgroundImage: `url("${monthStyle.heroSrc}")`,
                backgroundPosition: monthStyle.heroPosition,
              }}
              aria-hidden="true"
            />

            <div className="wc-hero-overlay" ref={overlayRef}>
              <span className="wc-season-tag">{monthStyle.season}</span>
              <span className="wc-destination-name">{monthStyle.destination}</span>
              <span className="wc-destination-meta">{monthStyle.country}</span>
              <span className="wc-year" onClick={() => openPicker("year")}>
                {year}
              </span>
              <span className="wc-month" onClick={() => openPicker("month")}>
                {MONTHS[month]}
              </span>
              <div className="wc-nav-btns">
                <button className="wc-nav-btn" onClick={prevMonth} aria-label="Previous month" type="button">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button className="wc-nav-btn" onClick={nextMonth} aria-label="Next month" type="button">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>

            {pickerOpen &&
              createPortal(
                <div
                  id="wc-picker-portal"
                  className="wc-picker-popover"
                  style={{ top: pickerPos.top, right: pickerPos.right }}
                >
                  {pickerOpen === "year"
                    ? Array.from({ length: 21 }, (_, index) => today.getFullYear() - 5 + index).map((itemYear) => (
                        <button
                          key={itemYear}
                          className={`wc-picker-item${itemYear === year ? " wc-picker-item--active" : ""}`}
                          onClick={() => {
                            const target = new Date(itemYear, month, 1);
                            goToMonth(target, itemYear >= year ? "next" : "prev", focusedDay);
                            setPickerOpen(null);
                          }}
                          type="button"
                        >
                          {itemYear}
                        </button>
                      ))
                    : MONTHS.map((name, index) => (
                        <button
                          key={name}
                          className={`wc-picker-item${index === month ? " wc-picker-item--active" : ""}`}
                          onClick={() => {
                            const target = new Date(year, index, 1);
                            goToMonth(target, index >= month ? "next" : "prev", focusedDay);
                            setPickerOpen(null);
                          }}
                          type="button"
                        >
                          {name}
                        </button>
                      ))}
                </div>,
                document.body,
              )}
          </div>

          <div className="wc-lower">
            <aside className="wc-notes">
              <div className="wc-notes-header">
                <button
                  className="wc-notes-collapse-btn"
                  onClick={() => setNotesOpen((open) => !open)}
                  type="button"
                  aria-expanded={notesOpen}
                >
                  <div>
                    <p className="wc-notes-label">Notes</p>
                    <p className="wc-notes-subtitle">Hover previews, click to edit</p>
                  </div>
                  <span className={`wc-notes-chevron${notesOpen ? " wc-notes-chevron--open" : ""}`}>
                    <FontAwesomeIcon icon={faChevronDown} />
                  </span>
                </button>
                <button className="wc-notes-toggle" onClick={() => setShowAllNotes((value) => !value)} type="button">
                  {showAllNotes ? "Focused editor" : `All saved (${monthNotesList.length})`}
                </button>
              </div>

              <div className={`wc-notes-body${notesOpen ? " wc-notes-body--open" : ""}`}>
                {showAllNotes ? (
                  <NotesList items={monthNotesList} onDeleteGroup={deleteNoteGroup} onDeleteNote={deleteNoteItem} />
                ) : (
                  <div className="wc-notes-editor">
                    <p className="wc-notes-range">{notesRangeLabel || "Select a date or range"}</p>
                    {activeKey ? (
                      <>
                        <div className="wc-notes-fields">
                          {currentNotes.map((value, index) => (
                            <input
                              key={`${activeKey}-${index}`}
                              className="wc-note-input"
                              type="text"
                              placeholder={`Note ${index + 1}`}
                              value={value}
                              onChange={(event) => updateNote(index, event.target.value)}
                            />
                          ))}
                        </div>
                        <button className="wc-add-note" onClick={addNote} type="button">
                          + add another note
                        </button>
                      </>
                    ) : (
                      <p className="wc-empty-editor">
                        Use the grid to focus a date, then add a note here or preview notes inline on hover.
                      </p>
                    )}
                  </div>
                )}

                <div className="wc-holidays">
                  <p className="wc-holidays-label">This month</p>
                  {Object.keys(holidays).length === 0 ? (
                    <p className="wc-no-holiday">No holidays</p>
                  ) : (
                    Object.entries(holidays).map(([day, name]) => (
                      <div key={day} className="wc-holiday-item">
                        <span className="wc-holiday-dot" />
                        <span>
                          <strong>{day}</strong> {name}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>

            <div className="wc-grid-panel">
              <div className="wc-grid-topbar">
                <div className="wc-chip-row">
                  <button
                    className={`wc-chip${showWeekNumbers ? " wc-chip--active" : ""}`}
                    onClick={() => setShowWeekNumbers((value) => !value)}
                    type="button"
                    aria-pressed={showWeekNumbers}
                  >
                    <FontAwesomeIcon icon={faCalendarWeek} />
                    Week numbers
                  </button>
                  <div className="wc-chip wc-chip--static">
                    <FontAwesomeIcon icon={faKeyboard} />
                    Arrows + Enter
                  </div>
                  <div className="wc-chip wc-chip--static">
                    <FontAwesomeIcon icon={faWandMagicSparkles} />
                    Preloaded destinations
                  </div>
                </div>
                <p className="wc-art-label">{monthStyle.destination} travel pick</p>
              </div>

              <div className={`wc-weekdays${showWeekNumbers ? " wc-weekdays--with-weeks" : ""}`}>
                {showWeekNumbers && <div className="wc-weekday wc-weekday--weeknum">WK</div>}
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                  <div key={day} className={`wc-weekday${day === "SAT" || day === "SUN" ? " wc-weekday--weekend" : ""}`}>
                    {day}
                  </div>
                ))}
              </div>

              <div className="wc-days" role="grid" aria-label={`${MONTHS[month]} ${year}`}>
                {weeks.map((week, weekIndex) => (
                  <div
                    key={`week-${weekIndex}`}
                    className={`wc-week-row${showWeekNumbers ? " wc-week-row--with-weeks" : ""}`}
                    role="row"
                  >
                    {showWeekNumbers && (
                      <div className="wc-week-number" aria-label={`ISO week ${getISOWeekNumber(new Date(week[0].date.y, week[0].date.m, week[0].date.d))}`}>
                        {getISOWeekNumber(new Date(week[0].date.y, week[0].date.m, week[0].date.d))}
                      </div>
                    )}

                    {week.map((cell) => {
                      const preview = dayPreviews.get(cell.day);
                      const noteType = !cell.isOtherMonth ? getMarkerType(preview) : null;
                      const comparable = toComparable(cell.date);
                      const isStart = rs !== null && comparable === rs;
                      const isEnd = re !== null && comparable === re;
                      const inRange = minR !== null && maxR !== null && comparable >= minR && comparable <= maxR;
                      const holidayLabel = holidays[cell.day];
                      const isFocused = !cell.isOtherMonth && focusedDay === cell.day;
                      const showPreview = !cell.isOtherMonth && previewDay === cell.day && (preview?.preview.length ?? 0) > 0;
                      const ariaPieces = [formatLongDate(cell.date)];

                      if (cell.isToday) ariaPieces.push("today");
                      if (holidayLabel) ariaPieces.push(holidayLabel);
                      if (noteType) ariaPieces.push(`${preview?.totalCount ?? 0} notes`);
                      if (isStart && isEnd) ariaPieces.push("selected date");
                      else if (isStart) ariaPieces.push("range start");
                      else if (isEnd) ariaPieces.push("range end");
                      else if (inRange) ariaPieces.push("in selected range");

                      return (
                        <DayCell
                          key={cell.key}
                          day={cell.day}
                          ariaLabel={ariaPieces.join(", ")}
                          isOtherMonth={cell.isOtherMonth}
                          isToday={cell.isToday}
                          isWeekend={cell.isWeekend}
                          isStart={isStart}
                          isEnd={isEnd}
                          inRange={inRange}
                          hasHoliday={!cell.isOtherMonth && Boolean(holidayLabel)}
                          holidayLabel={holidayLabel}
                          noteType={noteType}
                          previewNotes={preview?.preview}
                          previewCount={preview?.totalCount}
                          showPreview={showPreview}
                          isFocused={isFocused}
                          buttonRef={isFocused ? handleButtonRef : undefined}
                          onClick={handleDayClickWrapper}
                          onMouseEnter={handleDayMouseEnter}
                          onMouseLeave={handleDayMouseLeave}
                          onFocus={handleDayFocus}
                          onBlur={handleDayBlur}
                          onKeyDown={handleDayKeyDown}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              <p className="wc-hint">{inlineHint}</p>
              {selectionSummary && <p className="wc-summary">{selectionSummary}</p>}
              {(rangeStart || rangeEnd) && (
                <button className="wc-clear" onClick={clearSelection} type="button">
                  Clear selection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
