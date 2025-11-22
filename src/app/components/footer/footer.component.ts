import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="rodape">
      <div class="rodape_redes_sociais">
        <i class="ph ph-instagram-logo"></i>
        <i class="ph ph-facebook-logo"></i>
        <i class="ph ph-whatsapp-logo"></i>
      </div>

      <div id="copyright">
        <p class="copyright">&copy; 2025 IZZI FITNESS. Todos os direitos reservados.</p>
      </div>

      <div class="imagem_logo_rodape">
        <img src="assets/Logo_IZ_sem_nome.jpeg" alt="Logo Rodapé" class="logo_rodape">
      </div>
    </footer>
  `,
  styles: [`
    .rodape {
      background-color: var(--primary-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 1rem 2rem; /* Adicionado padding interno */
      box-sizing: border-box;
    }

    .rodape_redes_sociais {
      display: flex;
      gap: 1rem;
      font-size: 2rem;
      color: var(--text-white);
      cursor: pointer;
    }

    .copyright {
      color: var(--text-white);
      font-weight: 700;
      margin: 0;
      text-align: center;
    }

    .logo_rodape {
      width: 80px; /* Reduzi um pouco para ficar harmônico */
      height: auto;
      border-radius: 8px; /* Opcional */
    }
    
    @media (max-width: 600px) {
      .rodape { flex-direction: column; gap: 1rem; }
    }
  `]
})
export class FooterComponent {}