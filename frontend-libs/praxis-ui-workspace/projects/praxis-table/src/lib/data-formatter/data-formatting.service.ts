import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import {
  DatePipe,
  DecimalPipe,
  CurrencyPipe,
  PercentPipe,
  UpperCasePipe,
  LowerCasePipe,
  TitleCasePipe,
} from '@angular/common';
import { ColumnDataType } from './data-formatter-types';

@Injectable({
  providedIn: 'root',
})
export class DataFormattingService {
  private groupSeparator: string;
  private decimalSeparator: string;

  constructor(
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private currencyPipe: CurrencyPipe,
    private percentPipe: PercentPipe,
    private upperCasePipe: UpperCasePipe,
    private lowerCasePipe: LowerCasePipe,
    private titleCasePipe: TitleCasePipe,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    const parts = new Intl.NumberFormat(this.locale).formatToParts(12345.6);
    this.groupSeparator = parts.find((p) => p.type === 'group')?.value || ',';
    this.decimalSeparator =
      parts.find((p) => p.type === 'decimal')?.value || '.';
  }

  /**
   * Apply formatting to a value based on column type and format string
   */
  formatValue(
    value: any,
    columnType: ColumnDataType,
    formatString: string,
  ): any {
    if (value === null || value === undefined) {
      return value;
    }

    try {
      // Coerce value to expected type
      const coercedValue = this.coerceValueToType(value, columnType);

      // Apply formatting based on column type
      switch (columnType) {
        case 'date':
          return this.formatDate(coercedValue, formatString);
        case 'number':
          return this.formatNumber(coercedValue, formatString);
        case 'currency':
          return this.formatCurrency(coercedValue, formatString);
        case 'percentage':
          return this.formatPercentage(coercedValue, formatString);
        case 'string':
          return this.formatString(coercedValue, formatString);
        case 'boolean':
          return this.formatBoolean(coercedValue, formatString);
        default:
          return value;
      }
    } catch (error) {
      console.warn(
        `Error formatting value ${value} with type ${columnType} and format ${formatString}:`,
        error,
      );
      return value; // Return original value on error
    }
  }

  /**
   * Coerce value to the expected type for formatting
   */
  private coerceValueToType(value: any, columnType: ColumnDataType): any {
    switch (columnType) {
      case 'date':
        if (value instanceof Date) return value;
        if (typeof value === 'string' || typeof value === 'number') {
          let date = new Date(value);
          if (typeof value === 'string' && isNaN(date.getTime())) {
            const parts = value.split(',');
            if (parts.length === 3) {
              const [year, month, day] = parts.map(Number);
              date = new Date(year, month - 1, day);
            }
          }
          return isNaN(date.getTime()) ? null : date;
        }
        if (Array.isArray(value)) {
          const [
            year,
            month = 1,
            day = 1,
            hour = 0,
            minute = 0,
            second = 0,
            millisecond = 0,
          ] = value;
          const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second),
            Number(millisecond),
          );
          return isNaN(date.getTime()) ? null : date;
        }
        return null;

      case 'number':
      case 'currency':
      case 'percentage':
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const normalized = value
            .replace(new RegExp(`\\${this.groupSeparator}`, 'g'), '')
            .replace(this.decimalSeparator, '.');
          const num = parseFloat(normalized);
          return isNaN(num) ? 0 : num;
        }
        return 0;

      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' || value === '1';
        }
        if (typeof value === 'number') {
          return value !== 0;
        }
        return Boolean(value);

      case 'string':
        return String(value);

      default:
        return value;
    }
  }

  /**
   * Format date values
   */
  private formatDate(value: Date | null, formatString: string): string {
    if (!value) return '';

    // Handle custom formats and presets
    try {
      return this.datePipe.transform(value, formatString) || '';
    } catch {
      return this.datePipe.transform(value, 'shortDate') || '';
    }
  }

  /**
   * Format number values
   */
  private formatNumber(value: number, formatString: string): string {
    if (formatString.includes('|nosep')) {
      // No thousands separator
      const format = formatString.replace('|nosep', '');
      const formatted =
        this.decimalPipe.transform(value, format, this.locale) ||
        value.toString();
      return this.removeGrouping(formatted);
    }

    return (
      this.decimalPipe.transform(value, formatString, this.locale) ||
      value.toString()
    );
  }

  /**
   * Format currency values
   */
  private formatCurrency(value: number, formatString: string): string {
    // Parse format: "BRL|symbol|2" or "USD|code|2"
    const parts = formatString.split('|');
    if (parts.length < 3) {
      return (
        this.currencyPipe.transform(
          value,
          'BRL',
          'symbol',
          '1.2-2',
          this.locale,
        ) || value.toString()
      );
    }

    const currencyCode = parts[0];
    const display = parts[1]; // 'symbol' or 'code'
    const decimals = parts[2];
    const noSep = parts.includes('nosep');
    const digitsInfo = `1.${decimals}-${decimals}`;

    const formatted =
      this.currencyPipe.transform(
        value,
        currencyCode,
        display,
        digitsInfo,
        this.locale,
      ) || value.toString();

    return noSep ? this.removeGrouping(formatted) : formatted;
  }

  /**
   * Format percentage values
   */
  private formatPercentage(value: number, formatString: string): string {
    if (formatString.includes('|x100')) {
      const format = formatString.replace('|x100', '');
      const formatted =
        this.decimalPipe.transform(value * 100, format, this.locale) ||
        (value * 100).toString();
      return `${formatted}%`;
    }

    return (
      this.percentPipe.transform(value, formatString, this.locale) ||
      value.toString()
    );
  }

  private removeGrouping(value: string): string {
    return value.replace(new RegExp(`\\${this.groupSeparator}`, 'g'), '');
  }

  /**
   * Format string values
   */
  private formatString(value: string, formatString: string): string {
    if (!formatString || formatString === 'none') {
      return value;
    }

    let result = value;

    // Parse format for truncation: "uppercase|truncate|50|..."
    if (formatString.includes('|truncate|')) {
      const parts = formatString.split('|');
      const transform = parts[0];
      const maxLength = parseInt(parts[2]) || 50;
      const suffix = parts[3] || '...';

      // Apply text transformation first
      result = this.applyStringTransform(result, transform);

      // Then apply truncation
      if (result.length > maxLength) {
        result = result.substring(0, maxLength) + suffix;
      }
    } else {
      // Apply only text transformation
      result = this.applyStringTransform(result, formatString);
    }

    return result;
  }

  /**
   * Apply string transformations
   */
  private applyStringTransform(value: string, transform: string): string {
    switch (transform) {
      case 'uppercase':
        return this.upperCasePipe.transform(value);
      case 'lowercase':
        return this.lowerCasePipe.transform(value);
      case 'titlecase':
        return this.titleCasePipe.transform(value);
      case 'capitalize':
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      default:
        return value;
    }
  }

  /**
   * Format boolean values
   */
  private formatBoolean(value: boolean, formatString: string): string {
    if (formatString.startsWith('custom|')) {
      const parts = formatString.split('|');
      const trueValue = parts[1] || 'Verdadeiro';
      const falseValue = parts[2] || 'Falso';
      return value ? trueValue : falseValue;
    }

    const displays: { [key: string]: { true: string; false: string } } = {
      'true-false': { true: 'Verdadeiro', false: 'Falso' },
      'yes-no': { true: 'Sim', false: 'Não' },
      'active-inactive': { true: 'Ativo', false: 'Inativo' },
      'on-off': { true: 'Ligado', false: 'Desligado' },
      'enabled-disabled': { true: 'Habilitado', false: 'Desabilitado' },
    };

    const display = displays[formatString] || displays['true-false'];
    return value ? display.true : display.false;
  }

  /**
   * Check if formatting is needed for a column
   */
  needsFormatting(columnType: ColumnDataType, formatString: string): boolean {
    return !!(formatString && formatString.trim() && columnType !== 'custom');
  }
}
