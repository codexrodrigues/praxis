import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { SectionConfiguratorComponent } from './section-configurator.component';
import { FormSection } from '@praxis/core';

describe('SectionConfiguratorComponent', () => {
  let component: SectionConfiguratorComponent;
  let fixture: ComponentFixture<SectionConfiguratorComponent>;

  const mockSection: FormSection = {
    id: 's1',
    title: 'Test Section',
    description: 'Test Description',
    rows: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionConfiguratorComponent, NoopAnimationsModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionConfiguratorComponent);
    component = fixture.componentInstance;
    component.section = JSON.parse(JSON.stringify(mockSection));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit a new section object on update', () => {
    spyOn(component.sectionChange, 'emit');
    component.onSectionUpdated({ title: 'New Title' });

    expect(component.sectionChange.emit).toHaveBeenCalled();
    const emittedSection = (component.sectionChange.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(emittedSection).not.toBe(component.section); // Ensure it's a new object
    expect(emittedSection.title).toBe('New Title');
  });

  it('should emit remove event on remove button click', () => {
    spyOn(component.remove, 'emit');
    const removeButton = fixture.nativeElement.querySelector('button[mat-icon-button]');
    removeButton.click();
    expect(component.remove.emit).toHaveBeenCalled();
  });

  it('should add a row and emit change', () => {
    spyOn(component.sectionChange, 'emit');
    component.addRow();
    expect(component.sectionChange.emit).toHaveBeenCalled();
    const emittedSection = (component.sectionChange.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(emittedSection.rows.length).toBe(1);
  });

  it('should remove a row and emit change', () => {
    component.section.rows = [{ columns: [] }]; // Add a row first
    fixture.detectChanges();

    spyOn(component.sectionChange, 'emit');
    component.removeRow(0);
    expect(component.sectionChange.emit).toHaveBeenCalled();
    const emittedSection = (component.sectionChange.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(emittedSection.rows.length).toBe(0);
  });
});
