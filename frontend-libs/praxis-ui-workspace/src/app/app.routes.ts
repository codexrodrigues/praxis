import { Routes } from '@angular/router';
import {Funcionarios} from './features/funcionarios/funcionarios';
import {Departamentos} from './features/departamentos/departamentos';
import {Enderecos} from './features/enderecos/enderecos';
import {Dependentes} from './features/dependentes/dependentes';
import {FeriasAfastamentos} from './features/ferias-afastamentos/ferias-afastamentos';
import {EventosFolha} from './features/eventos-folha/eventos-folha';
import {FolhaPagamento} from './features/folha-pagamento/folha-pagamento';
import {Cargos} from './features/cargos/cargos';
// import { IntegrationDemoComponent } from '@praxis/table';

export const routes: Routes = [
  { path: 'funcionarios', component: Funcionarios },
  { path: 'departamentos', component: Departamentos },
  { path: 'cargos', component: Cargos },
  { path: 'enderecos', component: Enderecos },
  { path: 'dependentes', component: Dependentes },
  { path: 'ferias-afastamentos', component: FeriasAfastamentos },
  { path: 'eventos-folha', component: EventosFolha },
  { path: 'folha-pagamento', component: FolhaPagamento },
  // { path: 'integration-demo', component: IntegrationDemoComponent },
  { path: '', redirectTo: '/funcionarios', pathMatch: 'full' }
];
