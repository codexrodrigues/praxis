import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PraxisDynamicForm } from '@praxis/dynamic-form';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GenericCrudService, ApiEndpoint } from '@praxis/core';

@Component({
  selector: 'app-evento-folha-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, PraxisDynamicForm],
  providers: [GenericCrudService],
  templateUrl: './evento-folha-view.component.html',
  styleUrl: './evento-folha-view.component.scss',
})
export class EventoFolhaViewComponent implements OnInit, OnDestroy {
  id: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private crudService: GenericCrudService<any>,
  ) {
    this.crudService.configure('eventos-folha', ApiEndpoint.HumanResources);
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.id = params.get('id');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
