import { Component, Input } from '@angular/core';

/**
 * Simple dynamic grid component placeholder.
 */
@Component({
  selector: 'puc-dynamic-grid',
  template: `<p>dynamic grid works!</p>`
})
export class DynamicGridComponent {
  @Input() metadata: any;
}
