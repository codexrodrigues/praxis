import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DependenteViewComponent } from './dependente-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GenericCrudService } from '@praxis/core';

describe('DependenteViewComponent', () => {
  let component: DependenteViewComponent;
  let fixture: ComponentFixture<DependenteViewComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(DependenteViewComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [DependenteViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DependenteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
