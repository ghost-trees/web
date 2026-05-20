export type YearMonth = {
  year: number;
  monthIndex: number;
};

export const MONTH_LABELS = [
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

function normalizeTwoDigitYear(year: number): number {
  if (year >= 100) {
    return year;
  }
  return year >= 70 ? 1900 + year : 2000 + year;
}

export function parseYearMonth(dateValue: string): YearMonth | null {
  const parsedDate = new Date(dateValue);
  if (!Number.isNaN(parsedDate.getTime())) {
    return {
      year: parsedDate.getFullYear(),
      monthIndex: parsedDate.getMonth(),
    };
  }

  const slashOrDashMatch = dateValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashOrDashMatch) {
    const month = Number(slashOrDashMatch[1]);
    const year = normalizeTwoDigitYear(Number(slashOrDashMatch[3]));
    if (
      Number.isFinite(month) &&
      Number.isFinite(year) &&
      month >= 1 &&
      month <= 12 &&
      year > 0
    ) {
      return { year, monthIndex: month - 1 };
    }
  }

  return null;
}

export function parsePointYear(dateValue: string): number | null {
  const parsedYearMonth = parseYearMonth(dateValue);
  if (parsedYearMonth) {
    return parsedYearMonth.year;
  }

  const dateYearMatch = dateValue.match(/\b(\d{4})\b/);
  if (!dateYearMatch) {
    return null;
  }

  const year = Number(dateYearMatch[1]);
  return Number.isFinite(year) ? year : null;
}

export function toYearMonthKey(yearMonth: YearMonth): number {
  return yearMonth.year * 12 + yearMonth.monthIndex;
}

export function formatYearMonthLabel(yearMonth: YearMonth): string {
  return `${MONTH_LABELS[yearMonth.monthIndex]} ${yearMonth.year}`;
}
