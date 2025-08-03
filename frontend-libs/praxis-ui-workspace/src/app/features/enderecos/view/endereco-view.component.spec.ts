import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnderecoViewComponent } from './endereco-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('EnderecoViewComponent', () => {
  let component: EnderecoViewComponent;
  let fixture: ComponentFixture<EnderecoViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnderecoViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnderecoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
