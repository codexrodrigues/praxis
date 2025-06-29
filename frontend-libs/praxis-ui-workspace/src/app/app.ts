import {Component, ViewChild, ElementRef, HostListener, Renderer2} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatDivider, MatListItem, MatListSubheaderCssMatStyler, MatNavList} from '@angular/material/list';
import {MatDrawer, MatDrawerContainer, MatDrawerContent, MatSidenavModule} from '@angular/material/sidenav';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule, MatIconButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {PraxisTable} from '@praxis/table';



// After
declare global {
  interface Window {
    MonacoEnvironment: {
      getWorkerUrl: (moduleId: string, label: string) => string;
    };
  }
}

window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId: string, label: string): string {
    return '/assets/monaco/min/vs/base/worker/workerMain.js';
  }
}

@Component({
  selector: 'app-root',
  imports: [MatSidenavModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIcon, MatToolbar, PraxisTable, MatNavList, MatListSubheaderCssMatStyler, MatListItem, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'praxis-ui-workspace';
  protected isMenuOpen = true;
  @ViewChild('drawer') drawer: MatDrawer | undefined;
  @ViewChild('menuToggleButton', {read: ElementRef}) menuToggleButton: ElementRef | undefined;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Verificar se o drawer está definido e aberto
    if (this.drawer?.opened) {
      // Verifica se o clique foi fora do menu e do botão de toggle
      const clickedInMenu = this.elementRef.nativeElement.querySelector('mat-drawer').contains(event.target);
      const clickedMenuToggle = this.menuToggleButton?.nativeElement.contains(event.target);

      if (!clickedInMenu && !clickedMenuToggle) {
        this.drawer.close();
      }
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    if (window.innerWidth < 768) {
      this.isMenuOpen = false;
    }
  }

  ngOnInit(): void {
    this.isMenuOpen = window.innerWidth > 768;
  }

  onResize(event: any): void {
    this.isMenuOpen = window.innerWidth > 768;
  }




}
