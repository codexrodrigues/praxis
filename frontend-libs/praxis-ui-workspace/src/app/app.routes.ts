import { Routes } from '@angular/router';
import { FuncionariosListComponent } from './features/funcionarios/list/funcionarios-list.component';
import { FuncionarioViewComponent } from './features/funcionarios/view/funcionario-view.component';
import { CargosListComponent } from './features/cargos/list/cargos-list.component';
import { CargoViewComponent } from './features/cargos/view/cargo-view.component';
import { DepartamentosListComponent } from './features/departamentos/list/departamentos-list.component';
import { DepartamentoViewComponent } from './features/departamentos/view/departamento-view.component';
import { EnderecosListComponent } from './features/enderecos/list/enderecos-list.component';
import { EnderecoViewComponent } from './features/enderecos/view/endereco-view.component';
import { DependentesListComponent } from './features/dependentes/list/dependentes-list.component';
import { DependenteViewComponent } from './features/dependentes/view/dependente-view.component';
import { FeriasAfastamentosListComponent } from './features/ferias-afastamentos/list/ferias-afastamentos-list.component';
import { FeriasAfastamentoViewComponent } from './features/ferias-afastamentos/view/ferias-afastamento-view.component';
import { EventosFolhaListComponent } from './features/eventos-folha/list/eventos-folha-list.component';
import { EventoFolhaViewComponent } from './features/eventos-folha/view/evento-folha-view.component';
import { FolhasPagamentoListComponent } from './features/folhas-pagamento/list/folhas-pagamento-list.component';
import { FolhaPagamentoViewComponent } from './features/folhas-pagamento/view/folha-pagamento-view.component';
// import { IntegrationDemoComponent } from '@praxis/table';

export const routes: Routes = [
  { path: 'funcionarios', component: FuncionariosListComponent },
  { path: 'funcionarios/view/:id', component: FuncionarioViewComponent },
  { path: 'cargos', component: CargosListComponent },
  { path: 'cargos/view/:id', component: CargoViewComponent },
  { path: 'departamentos', component: DepartamentosListComponent },
  { path: 'departamentos/view/:id', component: DepartamentoViewComponent },
  { path: 'enderecos', component: EnderecosListComponent },
  { path: 'enderecos/view/:id', component: EnderecoViewComponent },
  { path: 'dependentes', component: DependentesListComponent },
  { path: 'dependentes/view/:id', component: DependenteViewComponent },
  { path: 'ferias-afastamentos', component: FeriasAfastamentosListComponent },
  {
    path: 'ferias-afastamentos/view/:id',
    component: FeriasAfastamentoViewComponent,
  },
  { path: 'eventos-folha', component: EventosFolhaListComponent },
  { path: 'eventos-folha/view/:id', component: EventoFolhaViewComponent },
  { path: 'folhas-pagamento', component: FolhasPagamentoListComponent },
  { path: 'folhas-pagamento/view/:id', component: FolhaPagamentoViewComponent },
  // { path: 'integration-demo', component: IntegrationDemoComponent },
  { path: '', redirectTo: '/funcionarios', pathMatch: 'full' },
];
