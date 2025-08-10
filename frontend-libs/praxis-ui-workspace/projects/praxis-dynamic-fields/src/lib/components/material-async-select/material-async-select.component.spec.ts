import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MaterialAsyncSelectComponent } from './material-async-select.component';
import { GenericCrudService, API_URL, Page } from '@praxis/core';
import { of, throwError } from 'rxjs';

describe('MaterialAsyncSelectComponent', () => {
  let component: MaterialAsyncSelectComponent;
  let fixture: ComponentFixture<MaterialAsyncSelectComponent>;
  let crudService: jasmine.SpyObj<GenericCrudService<any>>;

  beforeEach(() => {
    const crudSpy = jasmine.createSpyObj<GenericCrudService<any>>(
      'GenericCrudService',
      ['configure', 'filter', 'getSchema'],
    );
    TestBed.configureTestingModule({
      imports: [MaterialAsyncSelectComponent],
      providers: [
        { provide: GenericCrudService, useValue: crudSpy },
        { provide: API_URL, useValue: { default: {} } },
      ],
    });
    crudService = TestBed.inject(GenericCrudService) as jasmine.SpyObj<
      GenericCrudService<any>
    >;
    fixture = TestBed.createComponent(MaterialAsyncSelectComponent);
    component = fixture.componentInstance;
  });

  it('should load options from endpoint', () => {
    const page: Page<any> = {
      content: [
        { id: '1', name: 'One' },
        { id: '2', name: 'Two' },
      ],
      totalElements: 2,
      totalPages: 1,
      pageNumber: 0,
      pageSize: 50,
    };
    crudService.filter.and.returnValue(of(page));

    component.setSelectMetadata({
      endpoint: 'items',
      optionLabelKey: 'name',
      optionValueKey: 'id',
    } as any);

    expect(crudService.configure).toHaveBeenCalledWith('items');
    expect(component.options()).toEqual([
      { label: 'One', value: '1' },
      { label: 'Two', value: '2' },
    ]);
  });

  it('should retry loading after error', () => {
    const page: Page<any> = {
      content: [{ id: '1', name: 'One' }],
      totalElements: 1,
      totalPages: 1,
      pageNumber: 0,
      pageSize: 50,
    };
    crudService.filter.and.returnValues(
      throwError(() => new Error('fail')),
      of(page),
    );

    component.setSelectMetadata({
      endpoint: 'items',
      optionLabelKey: 'name',
      optionValueKey: 'id',
    } as any);

    expect(component.error()).toBe('fail');
    component.retry();
    expect(crudService.filter).toHaveBeenCalledTimes(2);
    expect(component.options()).toEqual([{ label: 'One', value: '1' }]);
  });

  it('should render empty option text when provided', () => {
    component.setSelectMetadata({
      selectOptions: [{ label: 'One', value: '1' }],
      emptyOptionText: 'None',
    } as any);
    fixture.detectChanges();
    const option = fixture.debugElement.query(By.css('mat-option'));
    expect(option.nativeElement.textContent.trim()).toBe('None');
  });

  it('should not render empty option when multiple is true', () => {
    component.setSelectMetadata({
      selectOptions: [{ label: 'One', value: '1' }],
      emptyOptionText: 'None',
      multiple: true,
    } as any);
    fixture.detectChanges();
    const options = fixture.debugElement.queryAll(By.css('mat-option'));
    expect(options.length).toBe(1);
    expect(options[0].nativeElement.textContent.trim()).toBe('One');
  });
});
