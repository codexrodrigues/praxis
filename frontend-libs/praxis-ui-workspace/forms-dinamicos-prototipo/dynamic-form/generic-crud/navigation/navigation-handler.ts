import { Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { FieldMetadata } from '../../../models/field-metadata.model';

import { CrudNavigationRequestEvent } from '../generic-crud.component';

/**
 * Interface para definir os eventos de navegação emitidos em dashboard mode
 */
export interface NavigationEvents {
  requestCreate: EventEmitter<CrudNavigationRequestEvent>;
  requestEdit: EventEmitter<CrudNavigationRequestEvent>;
  requestView: EventEmitter<CrudNavigationRequestEvent>;
  requestList: EventEmitter<CrudNavigationRequestEvent>;
}

/**
 * Classe abstrata para lidar com navegação no GenericCrudComponent
 * Permite diferentes estratégias de navegação: Router tradicional ou Dashboard mode
 */
export abstract class NavigationHandler {
  abstract goToCreate(): void;
  abstract goToEdit(id: any): void;
  abstract goToView(id: any): void;
  abstract goToList(): void;
}

/**
 * Implementação da navegação tradicional usando Angular Router
 * Mantém compatibilidade total com o comportamento atual
 */
export class RouterNavigationHandler extends NavigationHandler {
  constructor(
    private router: Router,
    private getCurrentSchema: () => FieldMetadata[]
  ) {
    super();
  }

  goToCreate(): void {
    const basePath = this.getBasePath();
    this.router.navigate([`${basePath}/novo`], {
      state: { schema: this.getCurrentSchema() }
    });
  }

  goToEdit(id: any): void {
    const basePath = this.getBasePath();
    this.router.navigate([`${basePath}/editar/${id}`], {
      state: { schema: this.getCurrentSchema() }
    });
  }

  goToView(id: any): void {
    const basePath = this.getBasePath();
    this.router.navigate([`${basePath}/visualizar/${id}`], {
      state: { schema: this.getCurrentSchema() }
    });
  }

  goToList(): void {
    const basePath = this.getBasePath();
    this.router.navigate([basePath]);
  }

  /**
   * Extrai o caminho base da URL atual, removendo segmentos específicos do CRUD
   * Mantém a lógica original de manipulação de URL
   */
  private getBasePath(): string {
    const baseUrl = this.router.url.split('?')[0];
    return baseUrl.split('/novo')[0].split('/editar')[0].split('/visualizar')[0];
  }
}

/**
 * Implementação da navegação para Dashboard mode
 * Emite eventos ao invés de navegar, permitindo que o dashboard intercepte e gerencie
 */
export class DashboardNavigationHandler extends NavigationHandler {
  constructor(private events: NavigationEvents) {
    super();
  }

  goToCreate(): void {
    this.events.requestCreate.emit();
  }

  goToEdit(id: any): void {
    this.events.requestEdit.emit({
      action: 'edit',
      itemId: id,
      context: {
        currentMode: 'list',
        resourcePath: '',
        dashboardMode: true
      },
      timestamp: new Date()
    });
  }

  goToView(id: any): void {
    this.events.requestView.emit({
      action: 'view',
      itemId: id,
      context: {
        currentMode: 'list',
        resourcePath: '',
        dashboardMode: true
      },
      timestamp: new Date()
    });
  }

  goToList(): void {
    this.events.requestList.emit();
  }
}
