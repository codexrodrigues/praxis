import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateUtilsService {
  parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    try {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  }

  getDefaultDateFormat(controlType?: string): string {
    switch (controlType) {
      case 'datetime':
        return 'dd/MM/yyyy HH:mm';
      case 'timepicker':
        return 'HH:mm';
      default:
        return 'dd/MM/yyyy';
    }
  }
}
