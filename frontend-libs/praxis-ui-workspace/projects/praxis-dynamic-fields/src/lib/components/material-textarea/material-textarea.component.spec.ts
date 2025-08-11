import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FieldControlType, MaterialTextareaMetadata } from '@praxis/core';
import { MaterialTextareaComponent } from './material-textarea.component';

describe('MaterialTextareaComponent', () => {
  let component: MaterialTextareaComponent;
  let fixture: ComponentFixture<MaterialTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialTextareaComponent,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialTextareaComponent);
    component = fixture.componentInstance;
    const metadata: MaterialTextareaMetadata = {
      controlType: FieldControlType.TEXTAREA,
      name: 'description',
      label: 'Description',
    } as any;
    component.setInputMetadata(metadata);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit value changes', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    component.setValue('test');
    expect(spy).toHaveBeenCalledWith('test');
  });
});
