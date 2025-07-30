import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PraxisDynamicForm } from '@praxis/dynamic-form';

@Component({
  selector: 'app-funcionario-view',
  standalone: true,
  imports: [CommonModule, PraxisDynamicForm],
  templateUrl: './funcionario-view.html',
  styleUrl: './funcionario-view.scss'
})
export class FuncionarioView {
  id: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
    });
  }
}
