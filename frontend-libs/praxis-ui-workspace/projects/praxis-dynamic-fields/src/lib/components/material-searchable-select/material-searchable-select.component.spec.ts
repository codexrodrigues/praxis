import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MaterialSearchableSelectComponent } from './material-searchable-select.component';
import { GenericCrudService, API_URL, Page } from '@praxis/core';
import { of } from 'rxjs';

describe('MaterialSearchableSelectComponent', () => {
  let component: MaterialSearchableSelectComponent;
  let fixture: ComponentFixture<MaterialSearchableSelectComponent>;
  let crudService: jasmine.SpyObj<GenericCrudService<any>>;

  beforeEach(() => {
    const crudSpy = jasmine.createSpyObj<GenericCrudService<any>>(
      'GenericCrudService',
      ['configure', 'filter', 'getSchema'],
    );
    TestBed.configureTestingModule({
      imports: [MaterialSearchableSelectComponent],
      providers: [
        { provide: GenericCrudService, useValue: crudSpy },
        { provide: API_URL, useValue: { default: {} } },
      ],
    });
    crudService = TestBed.inject(GenericCrudService) as jasmine.SpyObj<
      GenericCrudService<any>
    >;
    fixture = TestBed.createComponent(MaterialSearchableSelectComponent);
    component = fixture.componentInstance;
  });

  it('filters options based on search term', () => {
    component.setSelectMetadata({
      label: 'Test',
      selectOptions: [
        { label: 'Apple', value: 'a' },
        { label: 'Banana', value: 'b' },
      ],
      searchable: true,
    } as any);
    fixture.detectChanges();

    let term = '';
    component.searchTermChange.subscribe((t) => (term = t));
    component.onSearch('ban');
    fixture.detectChanges();

    expect(term).toBe('ban');
    expect(component.filteredOptions().length).toBe(1);
    expect(component.filteredOptions()[0].label).toBe('Banana');
  });

  it('requests remote options when searching with endpoint', () => {
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
      label: 'Remote',
      endpoint: 'items',
      optionLabelKey: 'name',
      optionValueKey: 'id',
    } as any);

    component.onSearch('On');

    expect(crudService.configure).toHaveBeenCalledWith('items');
    expect(crudService.filter).toHaveBeenCalledWith(
      { name: 'On' },
      { pageNumber: 0, pageSize: 50 },
    );
  });

  it('renders empty option when emptyOptionText is provided', () => {
    component.setSelectMetadata({
      selectOptions: [{ label: 'Apple', value: 'a' }],
      emptyOptionText: 'None',
    } as any);
    fixture.detectChanges();
    const option = fixture.debugElement.query(By.css('mat-option'));
    expect(option.nativeElement.textContent.trim()).toBe('None');
  });
});
