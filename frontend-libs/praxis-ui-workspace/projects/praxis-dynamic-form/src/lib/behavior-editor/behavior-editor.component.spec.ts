import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BehaviorEditorComponent } from './behavior-editor.component';
import { FormConfig } from '@praxis/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

describe('BehaviorEditorComponent', () => {
  let component: BehaviorEditorComponent;
  let fixture: ComponentFixture<BehaviorEditorComponent>;

  const mockConfig: FormConfig = {
    fieldMetadata: [],
    layout: { sections: [] },
    behavior: {
      confirmOnUnsavedChanges: true,
      trackHistory: false,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BehaviorEditorComponent, NoopAnimationsModule, FormsModule, MatSlideToggleModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BehaviorEditorComponent);
    component = fixture.componentInstance;
    component.config = JSON.parse(JSON.stringify(mockConfig));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect initial config in slide toggles', () => {
    const slideToggles = fixture.nativeElement.querySelectorAll('mat-slide-toggle');
    // confirmOnUnsavedChanges is true
    expect(slideToggles[0].classList.contains('mat-mdc-slide-toggle-checked')).toBe(true);
    // trackHistory is false
    expect(slideToggles[1].classList.contains('mat-mdc-slide-toggle-checked')).toBe(false);
  });

  it('should call updateBehavior on toggle change', () => {
    spyOn(component, 'updateBehavior');
    const slideToggle = fixture.nativeElement.querySelector('mat-slide-toggle');
    slideToggle.click();
    fixture.detectChanges();
    expect(component.updateBehavior).toHaveBeenCalledWith('confirmOnUnsavedChanges', false);
  });

  it('should update config and emit change on updateBehavior call', () => {
    spyOn(component.configChange, 'emit');
    component.updateBehavior('trackHistory', true);
    expect(component.config.behavior?.trackHistory).toBe(true);
    expect(component.configChange.emit).toHaveBeenCalledWith(component.config);
  });

  it('should update redirect URL from input', () => {
    spyOn(component, 'updateBehavior').and.callThrough();
    spyOn(component.configChange, 'emit');
    const redirectInput = fixture.nativeElement.querySelector('input[matInput]');
    redirectInput.value = '/success';
    redirectInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.updateBehavior).toHaveBeenCalledWith('redirectAfterSave', '/success');
    expect(component.config.behavior?.redirectAfterSave).toBe('/success');
    expect(component.configChange.emit).toHaveBeenCalled();
  });
});
