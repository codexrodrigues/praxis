import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FieldOption } from '@praxis/core';

@Component({
  selector: 'pdx-select-options-list',
  standalone: true,
  templateUrl: './select-options-list.component.html',
  styleUrls: ['./select-options-list.component.scss'],
  imports: [
    CommonModule,
    MatOptionModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    ScrollingModule
  ]
})
export class SelectOptionsListComponent {
  @Input() options: FieldOption[] = [];
  @Input() groupedOptions: { [key: string]: FieldOption[] } = {};
  @Input() multiple = false;
  @Input() selectedValues: any[] = [];
  @Input() useVirtualization = false;
  @Output() optionSelected = new EventEmitter<any>();

  trackByGroup(index: number, group: any): string {
    return group.key;
  }

  trackByValue(index: number, option: FieldOption): any {
    return option.value;
  }

  isSelected(value: any): boolean {
    return this.selectedValues.includes(value);
  }
}
