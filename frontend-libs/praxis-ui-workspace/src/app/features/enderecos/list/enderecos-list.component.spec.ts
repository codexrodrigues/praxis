import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnderecosListComponent } from './enderecos-list.component';
import { GenericCrudService } from '@praxis/core';

describe('EnderecosListComponent', () => {
  let component: EnderecosListComponent;
  let fixture: ComponentFixture<EnderecosListComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(EnderecosListComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [EnderecosListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EnderecosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
