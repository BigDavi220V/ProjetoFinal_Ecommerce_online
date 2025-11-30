import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CarrinhoService } from '../../services/carrinho.service';

/**
 * Interface para definir o item do carrossel (imagem ou vídeo)
 */
interface CarouselItem {
  url: string;
  type: 'image' | 'video';
}

@Component({
  selector: 'app-detalhes-do-produto',
  standalone: true,
  imports: [CommonModule], // Importante: CommonModule necessário para diretivas básicas
  templateUrl: './detalhes-do-produto.component.html',
  styleUrl: './detalhes-do-produto.component.css'
})
export class DetalhesDoProdutoComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private productService = inject(ProductService);
  private carrinhoService = inject(CarrinhoService);

  // Referência ao elemento de vídeo atual (se houver)
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  product?: Product;

  // Opções de tamanho disponíveis
  sizes: string[] = ['P', 'M', 'G', 'GG'];
  
  // Estado do tamanho selecionado pelo usuário
  selectedSize: string | null = null;

  // Variáveis do Carrossel
  carouselItems: CarouselItem[] = [];
  currentImageIndex = 0;
  private autoSlideInterval: any;
  private resumeSlideTimeout: any;
  isPaused = false;

  // Mapa de imagens adicionais por ID do produto
  private productExtraImages: Record<number, string[]> = {
    1: ['assets/Modelo_01.png',
      'assets/01_card/Modelo_02.JPEG',
      'assets/01_card/Modelo_03.JPEG',
      'assets/01_card/Modelo_04.png',
    ],
    2: ['assets/Modelo_02.png', 
      'assets/Naise_azul_claro.png',
      'assets/02_card/Modelo_04.JPEG',
      'assets/02_card/Modelo_06.JPEG',
      'assets/02_card/Modelo_07.jpg',
      'assets/02_card/Modelo_08.jpg'
    ],
    3: ['assets/Modelo_03.png', 'assets/Naisi_azul_atrativo_pg2.png'],
    6: [
      'assets/assets IA/Modelo_vermelho01.png',
      'assets/assets IA/Modelo_vermelho02.png',
      'assets/assets IA/Modelo_vermelho03.png',
      'assets/assets IA/Modelo_vermelho04.png',
      'assets/assets IA/Modelo_vermelho05.png',
      'assets/videos_marketing/Leg_vermelho.mp4'
    ],
    7:[
      'assets/assets IA/Modelo_Preto01.png',
      'assets/videos_marketing/Leg_Preto.mp4',
      'assets/Modelo_01_preto.png',
      'assets/Modelo_02_preto.png',
      'assets/Modelo_03_preto.png'
    ],
    8: ['assets/assets IA/Modelo_Azul_Turquesa01.png', 
      'assets/assets IA/Modelo_Azul_Turquesa02.png',
      'assets/videos_marketing/Azul_Turquesa.mp4'
    ],
    9: [
      'assets/assets IA/Modelo_Azul_Escuro01.png',
      'assets/videos_marketing/Leg_azul_marinho.mp4'
    ],
    10:[
      'assets/10_card/Modelo_01.png',
      'assets/10_card/Modelo_02.png',
      'assets/10_card/Modelo_03.png',
      'assets/10_card/Modelo_04.png',
      'assets/10_card/Modelo_05.png',

    ]
  };

  ngOnInit(): void {
    // Pega o ID da rota e busca o produto correspondente
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.product = this.productService.getProductById(id);
      if (this.product) {
        // Inicializa o array de imagens/videos
        this.loadProductMedia(id);
        this.startAutoSlide();
      }
    }
  }

  /**
   * Identifica se a URL é de um vídeo baseado na extensão
   */
  private isVideo(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  }

  private loadProductMedia(id: number): void {
    if (!this.product) return;

    const extraMedia = this.productExtraImages[id];
    let rawMediaList: string[] = [];

    if (extraMedia && extraMedia.length > 0) {
      if (!extraMedia.includes(this.product.image)) {
        rawMediaList = [this.product.image, ...extraMedia];
      } else {
        rawMediaList = [...extraMedia];
      }
    } else {
      rawMediaList = [this.product.image];
    }

    // Converte strings para objetos CarouselItem
    this.carouselItems = rawMediaList.map(url => ({
      url,
      type: this.isVideo(url) ? 'video' : 'image'
    }));
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    if (this.resumeSlideTimeout) {
      clearTimeout(this.resumeSlideTimeout);
    }
  }

  // --- Lógica do Carrossel ---

  get currentItem(): CarouselItem {
    return this.carouselItems[this.currentImageIndex];
  }
  
  // Getter para compatibilidade com código antigo que espera apenas URL
  get currentImage(): string {
    return this.currentItem.url;
  }
  
  // Getter para compatibilidade com código antigo (length)
  get images(): string[] {
    return this.carouselItems.map(i => i.url);
  }

  setMainImage(index: number): void {
    this.currentImageIndex = index;
    this.pauseAutoSlide();
    this.checkVideoAutoPlay();
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselItems.length;
    this.checkVideoAutoPlay();
  }

  prevImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.carouselItems.length) % this.carouselItems.length;
    this.checkVideoAutoPlay();
  }

  manualNext(): void {
    this.nextImage();
    this.pauseAutoSlide();
  }

  manualPrev(): void {
    this.prevImage();
    this.pauseAutoSlide();
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused) {
        // Se estiver tocando vídeo, não avança automaticamente até acabar (ou mantemos o timer?)
        // Requisito 3: "Pausar os vídeos quando não estiverem visíveis".
        // Se o item atual é vídeo e não está pausado, o carrossel deve respeitar o tempo ou o vídeo?
        // Vamos manter o timer simples por enquanto, mas resetar se for vídeo longo pode ser complexo.
        // Simplificação: o timer roda, mas se for vídeo, ele vai cortar. 
        // Melhoria: pausar o slide se for vídeo e deixar o vídeo dar play.
        
        if (this.currentItem.type === 'video' && !this.videoPlayer?.nativeElement.paused) {
           // Se o vídeo está tocando, não avança o slide automaticamente
           return;
        }
        
        this.nextImage();
      }
    }, 4000); // Aumentei para 4s conforme pedido original (estava 2s no último read)
  }

  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  pauseAutoSlide(): void {
    this.isPaused = true;
    if (this.resumeSlideTimeout) {
      clearTimeout(this.resumeSlideTimeout);
    }
    
    // Retoma após 8 segundos de inatividade
    this.resumeSlideTimeout = setTimeout(() => {
      this.isPaused = false;
    }, 8000);
  }

  handleImageError(index: number): void {
    if (this.carouselItems[index]) {
      // Define uma imagem de fallback e força o tipo para imagem
      this.carouselItems[index] = {
        url: 'assets/Logo_IZ_sem_nome.jpeg',
        type: 'image'
      };
    }
  }

  /**
   * Verifica se o item atual é vídeo e tenta reproduzir
   */
  private checkVideoAutoPlay(): void {
    // Pequeno delay para garantir que o DOM atualizou
    setTimeout(() => {
      if (this.currentItem.type === 'video' && this.videoPlayer) {
        this.videoPlayer.nativeElement.currentTime = 0;
        this.videoPlayer.nativeElement.play().catch(err => {
          console.warn('Autoplay bloqueado pelo navegador:', err);
          this.videoPlayer!.nativeElement.muted = true; // Tenta mutar para permitir autoplay
          this.videoPlayer!.nativeElement.play().catch(e => console.error('Falha ao reproduzir vídeo:', e));
        });
      }
    }, 100);
  }

  // --- Fim Lógica do Carrossel ---

  // Método para selecionar um tamanho ao clicar
  selectSize(size: string): void {
    this.selectedSize = size;
  }

}
