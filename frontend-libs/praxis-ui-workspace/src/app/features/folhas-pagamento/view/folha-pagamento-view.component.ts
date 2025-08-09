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
  selector: 'app-folha-pagamento-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, PraxisDynamicForm],
  providers: [GenericCrudService],
  templateUrl: './folha-pagamento-view.component.html',
  styleUrl: './folha-pagamento-view.component.scss',
})
export class FolhaPagamentoViewComponent implements OnInit, OnDestroy {
  id: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private crudService: GenericCrudService<any>,
  ) {
    this.crudService.configure('folhas-pagamento', ApiEndpoint.HumanResources);
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
