import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  SimpleBaseSelectComponent,
  SelectOption,
  SimpleSelectMetadata,
} from './simple-base-select.component';
import { GenericCrudService, Page } from '@praxis/core';

@Component({
  selector: 'pdx-test-select',
  standalone: true,
  template: '',
})
class TestSelectComponent extends SimpleBaseSelectComponent<string> {
  // expose a way to set metadata easily in tests
  apply(metadata: SimpleSelectMetadata<string>) {
    this.setSelectMetadata(metadata);
  }
}

describe('SimpleBaseSelectComponent', () => {
  let fixture: ComponentFixture<TestSelectComponent>;
  let component: TestSelectComponent;
  let crudService: jasmine.SpyObj<GenericCrudService<any>>;

  beforeEach(() => {
    const crudSpy = jasmine.createSpyObj<GenericCrudService<any>>(
      'GenericCrudService',
      ['configure', 'filter', 'getSchema'],
    );
    TestBed.configureTestingModule({
      imports: [TestSelectComponent],
      providers: [{ provide: GenericCrudService, useValue: crudSpy }],
    });
    crudService = TestBed.inject(GenericCrudService) as jasmine.SpyObj<
      GenericCrudService<any>
    >;
    crudService.getSchema.and.returnValue(of([]));
    fixture = TestBed.createComponent(TestSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load options from metadata', () => {
    const options: SelectOption<string>[] = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ];

    component.apply({ options });
    expect(component.options()).toEqual(options);
  });

  it('should emit events when option selected (single)', () => {
    const option: SelectOption<string> = { label: 'One', value: '1' };
    component.apply({ options: [option] });

    let selection: string | undefined;
    let emittedOption: SelectOption<string> | undefined;
    component.selectionChange.subscribe((v) => (selection = v as string));
    component.optionSelected.subscribe((o) => (emittedOption = o));

    component.selectOption(option);

    expect(selection).toBe('1');
    expect(emittedOption).toEqual(option);
  });

  it('should toggle select all in multiple mode', () => {
    const options: SelectOption<string>[] = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ];

    component.apply({ options, multiple: true, selectAll: true });
    component.toggleSelectAll();
    expect(component.internalControl.value).toEqual(['a', 'b']);
    expect(component.isAllSelected()).toBeTrue();
    component.toggleSelectAll();
    expect(component.internalControl.value).toEqual([]);
  });

  it('should filter options based on search term', () => {
    const options: SelectOption<string>[] = [
      { label: 'Apple', value: 'a' },
      { label: 'Banana', value: 'b' },
    ];

    component.apply({ options, searchable: true });
    let searchTerm = '';
    component.searchTermChange.subscribe((t) => (searchTerm = t));

    component.onSearch('ban');

    expect(searchTerm).toBe('ban');
    expect(component.filteredOptions().length).toBe(1);
    expect(component.filteredOptions()[0].value).toBe('b');
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

    let loaded: SelectOption<string>[] | undefined;
    component.optionsLoaded.subscribe((opts) => (loaded = opts));

    component.apply({
      endpoint: 'items',
      optionLabelKey: 'name',
      optionValueKey: 'id',
      filterCriteria: { type: 'A' },
    });

    expect(crudService.configure).toHaveBeenCalledWith('items');
    expect(loaded).toEqual([
      { label: 'One', value: '1' },
      { label: 'Two', value: '2' },
    ]);

    crudService.filter.calls.reset();
    component.onSearch('Th');
    expect(crudService.filter).toHaveBeenCalledWith(
      { type: 'A', name: 'Th' },
      { pageNumber: 0, pageSize: 50 },
    );
  });

  it('should infer schema keys when not provided', () => {
    const schema = [{ name: 'id' }, { name: 'name' }];
    crudService.getSchema.and.returnValue(of(schema));
    const page: Page<any> = {
      content: [{ id: '1', name: 'One' }],
      totalElements: 1,
      totalPages: 1,
      pageNumber: 0,
      pageSize: 50,
    };
    crudService.filter.and.returnValue(of(page));

    component.apply({ endpoint: 'items' });

    expect(crudService.getSchema).toHaveBeenCalled();
    expect(component.options()).toEqual([{ label: 'One', value: '1' }]);
  });

  it('applies metadata when set before initialization', () => {
    const page: Page<any> = {
      content: [{ id: '1', name: 'First' }],
      totalElements: 1,
      totalPages: 1,
      pageNumber: 0,
      pageSize: 50,
    };
    crudService.filter.and.returnValue(of(page));

    component.metadata.set({
      endpoint: 'items',
      optionLabelKey: 'name',
      optionValueKey: 'id',
    } as any);

    component.onComponentInit();

    expect(crudService.configure).toHaveBeenCalledWith('items');
    expect(component.options()).toEqual([{ label: 'First', value: '1' }]);
  });
});
