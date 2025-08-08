import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiWrappersTestComponent } from './ui-wrappers-test.component';

describe('UiWrappersTestComponent', () => {
  let component: UiWrappersTestComponent;
  let fixture: ComponentFixture<UiWrappersTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiWrappersTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiWrappersTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve resourcePath from shared routes', () => {
    expect((component as any).resourcePath).toBe('ui-test/wrappers');
  });
});
