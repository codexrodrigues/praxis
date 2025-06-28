import {Component, ViewChild} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatDivider, MatListItem, MatListSubheaderCssMatStyler, MatNavList} from '@angular/material/list';
import {MatDrawer, MatDrawerContainer, MatDrawerContent, MatSidenavModule} from '@angular/material/sidenav';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule, MatIconButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {PraxisTable} from '@praxis/table';

@Component({
  selector: 'app-root',
  imports: [MatSidenavModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIcon, MatToolbar, PraxisTable, MatNavList, MatListSubheaderCssMatStyler, MatListItem, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'praxis-ui-workspace';
  protected isMenuOpen = true; // Começa com o menu aberto
  @ViewChild('drawer') drawer: MatDrawer | undefined;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Método para fechar o menu ao selecionar um item (útil em telas pequenas)
  closeMenu(): void {
    if (window.innerWidth < 768) {
      this.isMenuOpen = false;
    }
  }

  // Método para definir se o menu deve estar aberto baseado na largura da tela
  ngOnInit(): void {
    this.isMenuOpen = window.innerWidth > 768;
  }

  // Método para reagir a mudanças na largura da janela
  onResize(event: any): void {
    this.isMenuOpen = window.innerWidth > 768;
  }
}
