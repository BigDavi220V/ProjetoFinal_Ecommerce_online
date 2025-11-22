import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="apresentacao">
      <section class="introducao">
        <p>
          Feito para o Seu Próximo Nível!<br><br>
          Seja na academia, no yoga ou na rua, a vida é movimento.
          E nós criamos a peça perfeita para cada passo do seu caminho.
          Descubra roupas que não apenas vestem, mas que impulsionam sua confiança, 
          garantindo o conforto, a tecnologia e o estilo que a sua jornada exige.
        </p>
      </section>

      <div class="video-container">
        <video controls autoplay muted loop width="300" height="500">
            <source src="assets/videos_marketing/Marketing_video_Pippit_20251105135010.mp4" type="video/mp4">
            Seu navegador não suporta a tag de vídeo.
        </video>
      </div>
    </main>
  `,
  styles: [`
    .apresentacao {
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-direction: row; /* Mantido do CSS 1 */
      padding: 5rem 10%; /* Usando padding ao invés de margin fixa para responsividade */
      flex-wrap: wrap;
      gap: 2rem;
    }

    .introducao {
      flex: 1;
      min-width: 300px;
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--text-dark);
      text-align: left;
    }

    .video-container {
      flex-shrink: 0;
    }
    
    @media (max-width: 768px) {
      .apresentacao { flex-direction: column; }
    }
  `]
})
export class HomeComponent {}