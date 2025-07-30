import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsetConfiguratorComponent } from './fieldset-configurator.component';

describe('FieldsetConfiguratorComponent', () => {
  let component: FieldsetConfiguratorComponent;
  let fixture: ComponentFixture<FieldsetConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldsetConfiguratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldsetConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
