import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="app-container">
      @if (showLayout()) {
        <app-header></app-header>
      }
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      @if (showLayout()) {
        <app-footer></app-footer>
      }
    </div>
  `
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  
  // Signal para controlar a visibilidade (True = mostra menu, False = esconde)
  showLayout = signal(false);

  constructor() {
    // Inscreve-se nos eventos de rota para detectar mudanças de URL
    this.router.events.pipe(
      // Filtra apenas quando a navegação termina (para ter certeza da URL final)
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkLayout(event.urlAfterRedirects || event.url);
    });
  }

  ngOnInit() {
    // Verificação inicial caso a página seja recarregada
    this.checkLayout(this.router.url);
  }

  private checkLayout(url: string) {
    // Lista de rotas onde o Header/Footer NÃO devem aparecer
    const hiddenRoutes = ['/login', '/cadastro', '/forgot-password'];

    // Se for a raiz, esconde o layout para evitar flash antes do redirecionamento
    if (url === '/' || url === '') {
      this.showLayout.set(false);
      return;
    }

    // Verifica se a URL atual começa com alguma das rotas proibidas
    // Usamos 'includes' para pegar casos como '/login?returnUrl=...'
    const isHidden = hiddenRoutes.some(route => url.toLowerCase().includes(route));

    // Se for uma rota escondida, showLayout vira false. Caso contrário, true.
    this.showLayout.set(!isHidden);
  }
}