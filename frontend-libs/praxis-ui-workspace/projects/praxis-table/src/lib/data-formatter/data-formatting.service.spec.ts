import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import {
  DatePipe,
  DecimalPipe,
  CurrencyPipe,
  PercentPipe,
  UpperCasePipe,
  LowerCasePipe,
  TitleCasePipe,
  registerLocaleData,
} from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { DataFormattingService } from './data-formatting.service';

describe('DataFormattingService', () => {
  let service: DataFormattingService;

  beforeEach(() => {
    registerLocaleData(localePt);
    TestBed.configureTestingModule({
      providers: [
        DatePipe,
        DecimalPipe,
        CurrencyPipe,
        PercentPipe,
        UpperCasePipe,
        LowerCasePipe,
        TitleCasePipe,
        DataFormattingService,
        { provide: LOCALE_ID, useValue: 'pt-BR' },
      ],
    });
    service = TestBed.inject(DataFormattingService);
  });

  it('formats comma-separated date strings', () => {
    const result = service.formatValue('1990,5,15', 'date', 'dd/MM/yyyy');
    expect(result).toBe('15/05/1990');
  });

  it('formats date arrays', () => {
    const result = service.formatValue([1990, 5, 15], 'date', 'dd/MM/yyyy');
    expect(result).toBe('15/05/1990');
  });

  it('formats date arrays with time components', () => {
    const result = service.formatValue(
      [1990, 5, 15, 13, 30, 0],
      'date',
      'dd/MM/yyyy',
    );
    expect(result).toBe('15/05/1990');
  });

  it('returns empty string for invalid date arrays', () => {
    const result = service.formatValue([1990, 15, 40], 'date', 'dd/MM/yyyy');
    expect(result).toBe('');
  });

  it('returns empty string for invalid comma-separated date strings', () => {
    const result = service.formatValue('1990,15,40', 'date', 'dd/MM/yyyy');
    expect(result).toBe('');
  });

  it('keeps decimal comma when suppressing thousand separator', () => {
    const result = service.formatValue(1234.56, 'number', '1.2-2|nosep');
    expect(result).toBe('1234,56');
  });

  it('removes thousand separator for currency when requested', () => {
    const result = service.formatValue(
      1234.56,
      'currency',
      'BRL|symbol|2|nosep',
    );
    expect(result).toBe('R$ 1234,56');
  });

  it('multiplies percentage values when x100 flag is present', () => {
    const result = service.formatValue(0.15, 'percentage', '1.0-0|x100');
    expect(result).toBe('15%');
  });
});
