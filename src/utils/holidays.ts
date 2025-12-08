// Public holidays for South Africa, UK, and USA for 2024-2026

interface Holiday {
  date: string; // YYYY-MM-DD format
  name: string;
  country: string;
}

export const PUBLIC_HOLIDAYS: Holiday[] = [
  // South Africa 2024
  { date: '2024-01-01', name: "New Year's Day", country: 'ZA' },
  { date: '2024-03-21', name: 'Human Rights Day', country: 'ZA' },
  { date: '2024-03-29', name: 'Good Friday', country: 'ZA' },
  { date: '2024-04-01', name: 'Family Day', country: 'ZA' },
  { date: '2024-04-27', name: 'Freedom Day', country: 'ZA' },
  { date: '2024-05-01', name: 'Workers Day', country: 'ZA' },
  { date: '2024-06-16', name: 'Youth Day', country: 'ZA' },
  { date: '2024-08-09', name: 'National Women\'s Day', country: 'ZA' },
  { date: '2024-09-24', name: 'Heritage Day', country: 'ZA' },
  { date: '2024-12-16', name: 'Day of Reconciliation', country: 'ZA' },
  { date: '2024-12-25', name: 'Christmas Day', country: 'ZA' },
  { date: '2024-12-26', name: 'Day of Goodwill', country: 'ZA' },

  // South Africa 2025
  { date: '2025-01-01', name: "New Year's Day", country: 'ZA' },
  { date: '2025-03-21', name: 'Human Rights Day', country: 'ZA' },
  { date: '2025-04-18', name: 'Good Friday', country: 'ZA' },
  { date: '2025-04-21', name: 'Family Day', country: 'ZA' },
  { date: '2025-04-27', name: 'Freedom Day', country: 'ZA' },
  { date: '2025-05-01', name: 'Workers Day', country: 'ZA' },
  { date: '2025-06-16', name: 'Youth Day', country: 'ZA' },
  { date: '2025-08-09', name: 'National Women\'s Day', country: 'ZA' },
  { date: '2025-09-24', name: 'Heritage Day', country: 'ZA' },
  { date: '2025-12-16', name: 'Day of Reconciliation', country: 'ZA' },
  { date: '2025-12-25', name: 'Christmas Day', country: 'ZA' },
  { date: '2025-12-26', name: 'Day of Goodwill', country: 'ZA' },

  // South Africa 2026
  { date: '2026-01-01', name: "New Year's Day", country: 'ZA' },
  { date: '2026-03-21', name: 'Human Rights Day', country: 'ZA' },
  { date: '2026-04-03', name: 'Good Friday', country: 'ZA' },
  { date: '2026-04-06', name: 'Family Day', country: 'ZA' },
  { date: '2026-04-27', name: 'Freedom Day', country: 'ZA' },
  { date: '2026-05-01', name: 'Workers Day', country: 'ZA' },
  { date: '2026-06-16', name: 'Youth Day', country: 'ZA' },
  { date: '2026-08-09', name: 'National Women\'s Day', country: 'ZA' },
  { date: '2026-09-24', name: 'Heritage Day', country: 'ZA' },
  { date: '2026-12-16', name: 'Day of Reconciliation', country: 'ZA' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'ZA' },
  { date: '2026-12-26', name: 'Day of Goodwill', country: 'ZA' },

  // UK 2024
  { date: '2024-01-01', name: "New Year's Day", country: 'UK' },
  { date: '2024-03-29', name: 'Good Friday', country: 'UK' },
  { date: '2024-04-01', name: 'Easter Monday', country: 'UK' },
  { date: '2024-05-06', name: 'Early May Bank Holiday', country: 'UK' },
  { date: '2024-05-27', name: 'Spring Bank Holiday', country: 'UK' },
  { date: '2024-08-26', name: 'Summer Bank Holiday', country: 'UK' },
  { date: '2024-12-25', name: 'Christmas Day', country: 'UK' },
  { date: '2024-12-26', name: 'Boxing Day', country: 'UK' },

  // UK 2025
  { date: '2025-01-01', name: "New Year's Day", country: 'UK' },
  { date: '2025-04-18', name: 'Good Friday', country: 'UK' },
  { date: '2025-04-21', name: 'Easter Monday', country: 'UK' },
  { date: '2025-05-05', name: 'Early May Bank Holiday', country: 'UK' },
  { date: '2025-05-26', name: 'Spring Bank Holiday', country: 'UK' },
  { date: '2025-08-25', name: 'Summer Bank Holiday', country: 'UK' },
  { date: '2025-12-25', name: 'Christmas Day', country: 'UK' },
  { date: '2025-12-26', name: 'Boxing Day', country: 'UK' },

  // UK 2026
  { date: '2026-01-01', name: "New Year's Day", country: 'UK' },
  { date: '2026-04-03', name: 'Good Friday', country: 'UK' },
  { date: '2026-04-06', name: 'Easter Monday', country: 'UK' },
  { date: '2026-05-04', name: 'Early May Bank Holiday', country: 'UK' },
  { date: '2026-05-25', name: 'Spring Bank Holiday', country: 'UK' },
  { date: '2026-08-31', name: 'Summer Bank Holiday', country: 'UK' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'UK' },
  { date: '2026-12-26', name: 'Boxing Day', country: 'UK' },

  // USA 2024
  { date: '2024-01-01', name: "New Year's Day", country: 'US' },
  { date: '2024-01-15', name: 'Martin Luther King Jr. Day', country: 'US' },
  { date: '2024-02-19', name: "Presidents' Day", country: 'US' },
  { date: '2024-05-27', name: 'Memorial Day', country: 'US' },
  { date: '2024-06-19', name: 'Juneteenth', country: 'US' },
  { date: '2024-07-04', name: 'Independence Day', country: 'US' },
  { date: '2024-09-02', name: 'Labor Day', country: 'US' },
  { date: '2024-10-14', name: 'Columbus Day', country: 'US' },
  { date: '2024-11-11', name: 'Veterans Day', country: 'US' },
  { date: '2024-11-28', name: 'Thanksgiving Day', country: 'US' },
  { date: '2024-12-25', name: 'Christmas Day', country: 'US' },

  // USA 2025
  { date: '2025-01-01', name: "New Year's Day", country: 'US' },
  { date: '2025-01-20', name: 'Martin Luther King Jr. Day', country: 'US' },
  { date: '2025-02-17', name: "Presidents' Day", country: 'US' },
  { date: '2025-05-26', name: 'Memorial Day', country: 'US' },
  { date: '2025-06-19', name: 'Juneteenth', country: 'US' },
  { date: '2025-07-04', name: 'Independence Day', country: 'US' },
  { date: '2025-09-01', name: 'Labor Day', country: 'US' },
  { date: '2025-10-13', name: 'Columbus Day', country: 'US' },
  { date: '2025-11-11', name: 'Veterans Day', country: 'US' },
  { date: '2025-11-27', name: 'Thanksgiving Day', country: 'US' },
  { date: '2025-12-25', name: 'Christmas Day', country: 'US' },

  // USA 2026
  { date: '2026-01-01', name: "New Year's Day", country: 'US' },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day', country: 'US' },
  { date: '2026-02-16', name: "Presidents' Day", country: 'US' },
  { date: '2026-05-25', name: 'Memorial Day', country: 'US' },
  { date: '2026-06-19', name: 'Juneteenth', country: 'US' },
  { date: '2026-07-04', name: 'Independence Day', country: 'US' },
  { date: '2026-09-07', name: 'Labor Day', country: 'US' },
  { date: '2026-10-12', name: 'Columbus Day', country: 'US' },
  { date: '2026-11-11', name: 'Veterans Day', country: 'US' },
  { date: '2026-11-26', name: 'Thanksgiving Day', country: 'US' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'US' },
];

export function isPublicHoliday(date: Date): Holiday | null {
  const dateStr = date.toISOString().split('T')[0];
  const holiday = PUBLIC_HOLIDAYS.find(h => h.date === dateStr);
  return holiday || null;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function getHolidayLabel(date: Date): string | null {
  const holiday = isPublicHoliday(date);
  if (holiday) {
    return `${holiday.name} (${holiday.country})`;
  }
  return null;
}
