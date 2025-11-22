import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="cabecalho">
      <div class="logo_e_login">
        <div class="imagem_logo">
          <a routerLink="/home">
            <img src="assets/Logo_IZ_com_nome.png" class="logo_sem_nome" alt="Logo Izzi Fitness">
          </a>
        </div>    
      </div>

      <div class="nave">
        <nav class="menu">
          <ul class="menu_itens">
            <li class="menu_item">
              <a routerLink="/home" class="menu_link">Início</a>
            </li>

            <li class="menu_item dropdown-container">
              <a routerLink="/produtos" class="menu_link">Produtos</a>
              <ul class="dropdown-menu">
                <li><a routerLink="/leggings">Leggings</a></li>
                <li><a routerLink="/tops">Tops e Sutiãs</a></li>
                <li><a routerLink="/blusas">Blusas e Camisetas</a></li>
              </ul>
            </li>
            
            <li class="menu_item"><a routerLink="/contato" class="menu_link">Contato</a></li>
            <li class="menu_item"><a routerLink="/carrinho" class="menu_link" aria-label="Carrinho de Compras">🛒Carrinho</a></li>
            
            <li class="menu_item">
              <div class="icon_login">
                <i class="ph ph-user"></i>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    /* ... Seus estilos continuam exatamente iguais ... */
    .cabecalho {
      background-color: var(--primary-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding-bottom: 1rem;
    }
    
    .logo_sem_nome { width: 150px; }

    .menu_itens {
      display: flex;
      gap: 5rem;
      align-items: center;
    }

    .menu_link {
      color: var(--text-white);
      font-size: 1.5rem;
      font-weight: 350;
      padding: 10px;
      transition: 0.3s;
    }

    .menu_link:hover {
      background-color: #fbfbfb31;
      font-weight: 900;
      text-decoration: underline;
      border-radius: 5px;
    }

    .icon_login {
      font-size: 2.5rem;
      color: #dd1569;
      cursor: pointer;
    }

    .dropdown-container { position: relative; }
    .dropdown-menu {
      display: none;
      position: absolute;
      background-color: var(--primary-color);
      top: 100%;
      left: 0;
      min-width: 150px;
      z-index: 10;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .dropdown-menu li a {
      display: block;
      padding: 10px;
      color: white;
    }

    .dropdown-container:hover .dropdown-menu {
      display: block;
    }
  `]
})
export class HeaderComponent {}