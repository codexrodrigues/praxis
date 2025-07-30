import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'pdx-select-search-input',
  standalone: true,
  templateUrl: './select-search-input.component.html',
  styleUrls: ['./select-search-input.component.scss'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class SelectSearchInputComponent {
  @Input() searchTerm = '';
  @Input() placeholder = 'Buscar...';
  @Input() disabled = false;

  @Output() searchInput = new EventEmitter<Event>();
  @Output() searchKeyDown = new EventEmitter<KeyboardEvent>();
  @Output() clear = new EventEmitter<void>();

  @ViewChild('input', { static: false }) inputEl?: ElementRef<HTMLInputElement>;

  focus(): void {
    this.inputEl?.nativeElement.focus();
  }

  clearInput(): void {
    if (this.inputEl) {
      this.inputEl.nativeElement.value = '';
    }
  }
}
