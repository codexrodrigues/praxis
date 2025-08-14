import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MessagesEditorComponent } from './messages-editor.component';
import { FormConfig } from '@praxis/core';

describe('MessagesEditorComponent', () => {
  let component: MessagesEditorComponent;
  let fixture: ComponentFixture<MessagesEditorComponent>;

  const mockConfig: FormConfig = {
    fieldMetadata: [],
    sections: [],
    messages: {
      createRegistrySuccess: 'Created!',
      createRegistryError: 'Failed to create.',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagesEditorComponent, NoopAnimationsModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesEditorComponent);
    component = fixture.componentInstance;
    component.config = JSON.parse(JSON.stringify(mockConfig));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateMessage on input change', () => {
    spyOn(component, 'updateMessage');
    const input = fixture.nativeElement.querySelector('input[matInput]');
    input.value = 'Success!';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.updateMessage).toHaveBeenCalledWith(
      'createRegistrySuccess',
      'Success!',
    );
  });

  it('should emit configChange on update', () => {
    spyOn(component.configChange, 'emit');
    component.updateMessage('createRegistryError', 'Error!');
    expect(component.configChange.emit).toHaveBeenCalled();
    expect(component.config.messages?.createRegistryError).toBe('Error!');
  });
});
