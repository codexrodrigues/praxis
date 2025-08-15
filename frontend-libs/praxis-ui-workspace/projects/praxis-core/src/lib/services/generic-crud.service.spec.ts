import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GenericCrudService, BatchDeleteResult } from './generic-crud.service';
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

  it('should delete multiple ids sequentially', () => {
    service.configure('items');
    const progress: any[] = [];
    service
      .deleteMany([1, 2], { progress: (e) => progress.push(e) })
      .subscribe((result) => {
        expect(result.successIds).toEqual([1, 2]);
        expect(result.errors.length).toBe(0);
      });

    const req1 = httpMock.expectOne('http://localhost:8087/api/items/1');
    expect(req1.request.method).toBe('DELETE');
    req1.flush({});

    const req2 = httpMock.expectOne('http://localhost:8087/api/items/2');
    expect(req2.request.method).toBe('DELETE');
    req2.flush({});

    expect(progress.length).toBe(2);
  });

  it('should report errors for failed deletions', () => {
    service.configure('items');
    let result: BatchDeleteResult<number> | undefined;
    service.deleteMany([1, 2]).subscribe((r) => (result = r));

    const req1 = httpMock.expectOne('http://localhost:8087/api/items/1');
    expect(req1.request.method).toBe('DELETE');
    req1.flush('err', { status: 500, statusText: 'Server Error' });

    const req2 = httpMock.expectOne('http://localhost:8087/api/items/2');
    expect(req2.request.method).toBe('DELETE');
    req2.flush({});

    expect(result?.successIds).toEqual([2]);
    expect(result?.errors.length).toBe(1);
    expect(result?.errors[0].id).toBe(1);
  });
});
