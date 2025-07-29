import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FieldOption } from '@praxis/core';

@Component({
  selector: 'pdx-select-chips',
  standalone: true,
  templateUrl: './select-chips.component.html',
  styleUrls: ['./select-chips.component.scss'],
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule
  ]
})
export class SelectChipsComponent {
  @Input() selectedOptions: FieldOption[] = [];
  @Input() disabled = false;
  @Output() remove = new EventEmitter<FieldOption>();
}
