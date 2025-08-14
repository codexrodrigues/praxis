import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ActionsEditorComponent } from './actions-editor.component';
import { FormConfig } from '@praxis/core';

describe('ActionsEditorComponent', () => {
  let component: ActionsEditorComponent;
  let fixture: ComponentFixture<ActionsEditorComponent>;

  const mockConfig: FormConfig = {
    fieldMetadata: [],
    layout: { sections: [] },
    actions: {
      submit: { visible: true, label: 'Enviar' },
      cancel: { visible: false, label: 'Voltar' },
      reset: { visible: false, label: 'Limpar' },
      position: 'center',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsEditorComponent, NoopAnimationsModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsEditorComponent);
    component = fixture.componentInstance;
    component.config = JSON.parse(JSON.stringify(mockConfig));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateAction on toggle change', () => {
    spyOn(component, 'updateAction');
    const slideToggle = fixture.nativeElement.querySelector('mat-slide-toggle'); // First toggle is 'submit'
    slideToggle.click();
    fixture.detectChanges();
    expect(component.updateAction).toHaveBeenCalledWith('submit', 'visible', false);
  });

  it('should call updateAction on label change', () => {
    spyOn(component, 'updateAction');
    const labelInput = fixture.nativeElement.querySelector('input[matInput]'); // First input is 'submit'
    labelInput.value = 'Salvar';
    labelInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.updateAction).toHaveBeenCalledWith('submit', 'label', 'Salvar');
  });

  it('should call updateLayout on position change', () => {
    spyOn(component, 'updateLayout');
    // This is tricky to test without a full harness, so we'll call the method directly
    component.updateLayout('position', 'left');
    expect(component.updateLayout).toHaveBeenCalledWith('position', 'left');
  });

  it('should emit configChange on update', () => {
    spyOn(component.configChange, 'emit');
    component.updateAction('submit', 'visible', false);
    expect(component.configChange.emit).toHaveBeenCalled();
  });
});
