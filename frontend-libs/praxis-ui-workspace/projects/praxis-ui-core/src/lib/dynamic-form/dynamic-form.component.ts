import { Component, Input } from '@angular/core';

/**
 * Simple dynamic form component placeholder.
 */
@Component({
  selector: 'puc-dynamic-form',
  template: `<p>dynamic form works!</p>`
})
export class DynamicFormComponent {
  @Input() metadata: any;
}
