import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GenericCrudService } from './generic-crud.service';
import { API_URL, ApiUrlConfig } from '../tokens/api-url.token';
import { SchemaNormalizerService } from './schema-normalizer.service';

describe('GenericCrudService', () => {
  let service: GenericCrudService<any>;
  let httpMock: HttpTestingController;
  const apiConfig: ApiUrlConfig = {
    default: { baseUrl: 'http://localhost:8087', path: 'api' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GenericCrudService,
        SchemaNormalizerService,
        { provide: API_URL, useValue: apiConfig },
      ],
    });
    service = TestBed.inject(GenericCrudService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should strip leading /api from resourcePath', () => {
    service.configure('/api/test');
    service.getAll().subscribe();
    const req = httpMock.expectOne('http://localhost:8087/api/test/all');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
  });

  it('should strip api prefix without leading slash', () => {
    service.configure('api/other');
    service.getAll().subscribe();
    const req = httpMock.expectOne('http://localhost:8087/api/other/all');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
  });

  it('should handle resourcePath with multiple api segments', () => {
    service.configure('/api/api/multi');
    service.getAll().subscribe();
    const req = httpMock.expectOne('http://localhost:8087/api/multi/all');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
  });

  it('should ignore domain from absolute resourcePath', () => {
    service.configure('http://example.com/api/external');
    service.getAll().subscribe();
    const req = httpMock.expectOne('http://localhost:8087/api/external/all');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
  });
});
