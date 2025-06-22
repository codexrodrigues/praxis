import { HttpHeaders } from '@angular/common/http';
import { ApiUrlEntry } from '../tokens/api-url.token';
import { buildHeaders } from '../tokens/api-url.token';

/**
 * Compose headers including optional API version information.
 * If the entry already defines custom headers, they will be preserved.
 * The version will be added using the provided header name when available.
 */
export function composeHeadersWithVersion(entry: ApiUrlEntry, headerName = 'Api-Version'): HttpHeaders | undefined {
  let headers = buildHeaders(entry) ?? new HttpHeaders();
  if (entry.version) {
    headers = headers.set(headerName, entry.version);
  }
  return headers.keys().length ? headers : undefined;
}
