import { InjectionToken } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

export interface ApiUrlEntry {
  baseUrl?: string;
  path?: string;
  fullUrl?: string;
  version?: string;
  headers?: HttpHeaders | Record<string, string | string[]>;
}

export interface ApiUrlConfig {
  [key: string]: ApiUrlEntry;
}

export const API_URL = new InjectionToken<ApiUrlConfig>('API_URL');

export function buildApiUrl(entry: ApiUrlEntry): string {
  if (!entry) {
    return '';
  }
  if (entry.fullUrl) {
    return entry.fullUrl.replace(/\/+$/, '');
  }
  let url = (entry.baseUrl ?? '').replace(/\/+$/, '');
  if (entry.path) {
    url += '/' + entry.path.replace(/^\/+/, '');
  }
  if (entry.version) {
    url += '/' + entry.version.replace(/^\/+/, '');
  }
  return url.replace(/\/+$/, '');
}

export function buildHeaders(entry: ApiUrlEntry): HttpHeaders | undefined {
  if (!entry || !entry.headers) {
    return undefined;
  }
  if (entry.headers instanceof HttpHeaders) {
    return entry.headers;
  }
  let headers = new HttpHeaders();
  Object.entries(entry.headers).forEach(([key, value]) => {
    headers = headers.set(key, value as string | string[]);
  });
  return headers;
}
