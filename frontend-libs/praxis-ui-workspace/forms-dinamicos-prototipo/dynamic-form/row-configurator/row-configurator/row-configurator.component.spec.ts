import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowConfiguratorComponent } from './row-configurator.component';

describe('RowConfiguratorComponent', () => {
  let component: RowConfiguratorComponent;
  let fixture: ComponentFixture<RowConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowConfiguratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RowConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
