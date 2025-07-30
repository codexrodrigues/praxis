import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldMetadataEditorComponent } from './field-metadata-editor.component';

describe('FieldMetadataEditorComponent', () => {
  let component: FieldMetadataEditorComponent;
  let fixture: ComponentFixture<FieldMetadataEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldMetadataEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldMetadataEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
