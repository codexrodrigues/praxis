import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { GenericCrudService } from '@praxis/core';
import { FieldDefinition, Page } from '@praxis/core';
import { Pageable } from '@praxis/core';
import {CommonModule } from "@angular/common";

@Component({
  selector: 'praxis-table',
  template: `
    <table mat-table [dataSource]="data" class="mat-elevation-z8">
      @for (col of displayedColumns; track col) {
        <ng-container [matColumnDef]="col">
          <th mat-header-cell *matHeaderCellDef>{{ getLabel(col) }}</th>
          <td mat-cell *matCellDef="let element">{{ element[col] }}</td>
        </ng-container>
      }
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
    <mat-paginator
      [length]="totalElements"
      [pageIndex]="pageIndex"
      [pageSize]="pageSize"
      (page)="onPage($event)">
    </mat-paginator>
  `,
  styles: [
    `table { width: 100%; }`
  ],
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, CommonModule ]
})
export class PraxisTableComponent implements OnChanges {
  @Input() resourcePath = '';
  data: any[] = [];
  displayedColumns: string[] = [];
  schema: FieldDefinition[] = [];

  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;

  constructor(private crudService: GenericCrudService<any>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resourcePath'] && this.resourcePath) {
      this.loadSchema();
    }
  }

  private loadSchema(): void {
    this.crudService.configure(this.resourcePath);
    this.crudService.getSchema().subscribe(schema => {
      this.schema = schema;
      this.displayedColumns = schema.filter(f => !f.tableHidden).map(f => f.name);
      this.loadData();
    });
  }

  private loadData(event?: PageEvent): void {
    const pageable: Pageable = {
      pageNumber: event ? event.pageIndex : this.pageIndex,
      pageSize: event ? event.pageSize : this.pageSize
    };
    this.crudService.filter({}, pageable).subscribe(page => this.updatePage(page));
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData(event);
  }

  private updatePage(page: Page<any>): void {
    this.data = page.content;
    this.totalElements = page.totalElements;
    this.pageIndex = page.pageNumber;
    this.pageSize = page.pageSize;
  }

  getLabel(name: string): string {
    const def = this.schema.find(f => f.name === name);
    return def?.label || name;
  }
}
