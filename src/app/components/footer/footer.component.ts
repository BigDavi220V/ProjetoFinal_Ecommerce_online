import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="rodape">
      <div class="rodape_redes_sociais">
       <a href="https://www.instagram.com/izzifitness.oficial/" target="_blank" style="color: var(--white);font-size: 2.5rem;"> <i class="ph ph-instagram-logo"></i> </a>
        <a href="https://l.instagram.com/?u=http%3A%2F%2Fwa.me%2F5571996661646%3Futm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio%26fbclid%3DPAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnqUptK4YJD8kj6PGaPcEDMg9jNhjDZEzB1AXzn2Ii_7nnqXZ6pSN-o6MDCwU_aem_p5GA8LKI2QYwwkkis5aQiw&e=AT002s9JlxbkvJaaicCNgqdMl5mUmX-2ol9vDDROz7kBzHdjGU8c7oTJjdX96MQ6D8ZliHcaT4AVw8C3BmAMVRfu3rSSc83wuPU6ElUoXg"
         target="_blank" style="color: var(--white);font-size: 2.5rem;"> <i class="ph ph-whatsapp-logo"></i> </a>
      </div>

      <div id="copyright">
        <p class="copyright">&copy; 2025 IZZI FITNESS. Todos os direitos reservados.</p>
      </div>

      <div class="imagem_logo_rodape">
        <img src="assets/Logo_IZ_com_nome.png" alt="Logo Rodapé" class="logo_rodape" style="width: 120px;">
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
      color: var(--white);
      cursor: pointer;
    }

    .copyright {
      color: var(--white);
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