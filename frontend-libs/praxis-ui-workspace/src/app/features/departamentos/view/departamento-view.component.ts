import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PraxisDynamicForm } from '@praxis/dynamic-form';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-departamento-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, PraxisDynamicForm],
  templateUrl: './departamento-view.component.html',
  styleUrl: './departamento-view.component.scss',
})
export class DepartamentoViewComponent implements OnInit, OnDestroy {
  id: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute) {}

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
