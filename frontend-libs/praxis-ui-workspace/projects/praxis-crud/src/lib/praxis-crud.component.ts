import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { PraxisTable } from '@praxis/table';
import { CrudLauncherService } from './crud-launcher.service';
import { CrudMetadata, FormOpenMode, assertCrudMetadata } from './crud.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'praxis-crud',
  standalone: true,
  imports: [PraxisTable],
  template: `
    @if (resolvedMetadata; as meta) {
      <praxis-table
        [config]="meta.table"
        [resourcePath]="meta.resource?.path"
        (rowAction)="onAction($event.action, $event.row)"
        (toolbarAction)="onAction($event.action)"
      ></praxis-table>
    }
  `,
})
export class PraxisCrudComponent implements OnChanges {
  /** JSON inline ou chave/URL resolvida pelo MetadataResolver */
  @Input({ required: true }) metadata!: CrudMetadata | string;
  @Input() context?: Record<string, unknown>;
  @Output() afterOpen = new EventEmitter<{
    mode: FormOpenMode;
    action: string;
  }>();
  @Output() afterClose = new EventEmitter<void>();
  @Output() afterSave = new EventEmitter<{
    id: string | number;
    data: unknown;
  }>();
  @Output() afterDelete = new EventEmitter<{ id: string | number }>();
  @Output() error = new EventEmitter<unknown>();

  resolvedMetadata!: CrudMetadata;
  private readonly launcher = inject(CrudLauncherService);
  @ViewChild(PraxisTable) private table!: PraxisTable;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metadata']) {
      try {
        this.resolvedMetadata =
          typeof this.metadata === 'string'
            ? (JSON.parse(this.metadata) as CrudMetadata)
            : this.metadata;
        assertCrudMetadata(this.resolvedMetadata);
      } catch (err) {
        this.error.emit(err);
      }
    }
  }

  async onAction(action: string, row?: Record<string, unknown>): Promise<void> {
    try {
      const actionMeta = this.resolvedMetadata.actions?.find(
        (a) => a.action === action,
      );
      if (!actionMeta) {
        return;
      }
      const { mode, ref } = await this.launcher.launch(
        actionMeta,
        row,
        this.resolvedMetadata,
      );
      this.afterOpen.emit({ mode, action: actionMeta.action });
      if (ref) {
        const idField = this.getIdField();
        ref
          .afterClosed()
          .pipe(takeUntilDestroyed())
          .subscribe((result) => {
            this.afterClose.emit();
            if (result?.type === 'save') {
              const data = result.data as Record<string, unknown>;
              const id = data?.[idField] as string | number;
              this.afterSave.emit({ id, data: result.data });
              this.refreshTable();
            }
            if (result?.type === 'delete') {
              const data = result.data as Record<string, unknown>;
              const id = data?.[idField] as string | number;
              this.afterDelete.emit({ id });
              this.refreshTable();
            }
          });
      }
    } catch (err) {
      this.error.emit(err);
    }
  }

  private refreshTable(): void {
    this.table.refetch();
  }

  private getIdField(): string {
    return (this.resolvedMetadata?.resource?.idField as string) || 'id';
  }
}
