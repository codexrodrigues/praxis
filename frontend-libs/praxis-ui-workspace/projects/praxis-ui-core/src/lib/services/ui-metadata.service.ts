import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiMetadataService {
  constructor(private http: HttpClient) {}

  /**
   * Fetch metadata from backend.
   */
  getMetadata(endpoint: string): Observable<any> {
    return this.http.get(endpoint);
  }
}
