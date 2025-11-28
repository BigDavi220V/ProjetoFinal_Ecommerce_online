import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="apresentacao">
      <section class="introducao">
        <h1>Feito para o Seu Próximo Nível!</h1>
        <p>
          
          Seja na academia, no yoga ou na rua, a vida é movimento.
          E nós criamos a peça perfeita para cada passo do seu caminho.
          Descubra roupas que não apenas vestem, mas que impulsionam sua confiança, 
          garantindo o conforto, a tecnologia e o estilo que a sua jornada exige.
        </p>
      </section>

      
        <video controls autoplay muted loop width="700" height="1100">
            <source src="assets/videos_marketing/Marketing_video_Pippit_20251105135010.mp4" type="video/mp4">
            Seu navegador não suporta a tag de vídeo.
        </video>
      
    </main>
  `,
  styles: [`
  /* Definindo variáveis que estavam faltando */
  :host {
    --text-dark: #333333;

    --font-family: 'Segoe UI', Roboto, sans-serif;
    --text-white: #FFFFFF;
    display: block;
    font-family: var(--font-family);
  }

  /* CSS BASE (Mobile First) */
  .apresentacao {
    display: flex;
    flex-direction: column; /* Começa em coluna no celular */
    align-items: center;
    justify-content: center;
    padding: 5rem 15%; /* Padding menor para mobile */
    
    min-height: 100vh; /* Garante altura total */
    box-sizing: border-box;
    flex-direction: row;

  }

  .introducao {
    
    text-align: justify;
  }
.introducao h1{
  color: var(--primary-color);
  font-size: 5rem;
}
  .introducao p {
     /* Fonte legível no mobile */
    font-size: 3rem;
    line-height: 1.8;
    color: var(--text-dark);
    font-weight: 700;
    margin: 0;
  }
  



   video{
    border-radius: 20px;
   
    object-fit: contain;
    display: flex;
    justify-content: cente
  }

  /* Classe para forçar o vídeo a ser responsivo, ignorando width/height fixos do HTML se necessário */
  .responsive-video {
    width: 100%;
    max-width: 400px; /* Limite no mobile */
    height: auto;
    border-radius: 20px; /* Um toque sutil de design */
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  /* MEDIA QUERY: NOTEBOOK/TABLET (>= 768px) */
  @media (min-width: 768px) {
    .apresentacao {
      flex-direction: row; /* Volta para linha */
      justify-content: space-around; /* Mantido do seu original */
      align-items: center; /* Centraliza verticalmente */
      padding: 5rem 10%; /* Seu padding original */
      gap: 3rem;
    }

    .introducao {
      flex: 1;
      min-width: 300px;
      font-size: 1.5rem; /* Seu tamanho original */
    }

    .introducao p {
      font-size: 1.5rem; /* Restaura tamanho grande */
    }

    .introducao p::first-line {
      font-size: 1.8rem;
    }

    .video-container {
      flex: 1; /* Permite que o container do vídeo cresça igual ao texto */
      flex-shrink: 0;
      max-width: 50%; /* Garante que não ocupe mais que metade */
      justify-content: flex-end; /* Joga o vídeo para a direita */
    }

    .responsive-video {
      max-width: 100%; /* Remove limite de 400px do mobile */
    }
  }

  /* MEDIA QUERY: DESKTOP GRANDE (>= 1440px - 24 polegadas) */
  @media (min-width: 1440px) {
    .apresentacao {
      padding: 15rem 10%; /* Mais respiro lateral */
      /* Limita largura total do conteúdo */
      margin: 0 auto; /* Centraliza o container na tela */
    }

    .introducao {
      width: 70%;
    }

    .introducao p {
      font-size: 1.8rem; /* Aumenta fonte para telas grandes */
    }

    .introducao p::first-line {
      font-size: 2.2rem;
    }
  }
`]
})
export class HomeComponent {}