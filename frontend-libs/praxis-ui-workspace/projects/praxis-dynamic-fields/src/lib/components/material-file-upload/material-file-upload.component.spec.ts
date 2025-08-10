import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FieldControlType, ComponentMetadata } from '@praxis/core';

import { MaterialFileUploadComponent } from './material-file-upload.component';

describe('MaterialFileUploadComponent', () => {
  let component: MaterialFileUploadComponent;
  let fixture: ComponentFixture<MaterialFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialFileUploadComponent,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialFileUploadComponent);
    component = fixture.componentInstance;
    const metadata: ComponentMetadata = {
      controlType: FieldControlType.FILE_UPLOAD,
      name: 'profilePicture',
      label: 'Profile Picture',
    } as any;
    component.setFileUploadMetadata(metadata);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit value when file selected', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    component.onFileSelected({ target: { files: [file] } } as any);
    expect(spy).toHaveBeenCalledWith(file);
  });
});
