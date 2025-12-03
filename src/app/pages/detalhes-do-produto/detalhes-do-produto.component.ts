import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router'; 
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
  imports: [CommonModule], 
  templateUrl: './detalhes-do-produto.component.html',
  styleUrl: './detalhes-do-produto.component.css'
})
export class DetalhesDoProdutoComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private productService = inject(ProductService);
  private carrinhoService = inject(CarrinhoService);
  private router = inject(Router);

  // Referência ao elemento de vídeo atual (se houver)
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  product?: Product;

  // Opções de tamanho disponíveis
  sizes: string[] = ['P', 'M', 'G', 'GG'];
  
  // Estado do tamanho selecionado pelo usuário
  selectedSize: string | null = null;

  // Estado da quantidade selecionada pelo usuário (usando Signal)
  quantity = signal(1);

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

  constructor() {
    // Reage a mudanças na lista de produtos (ex: carregamento tardio)
    effect(() => {
      const products = this.productService.products();
      const idParam = this.route.snapshot.paramMap.get('id');
      
      if (idParam && products.length > 0 && !this.product) {
         const id = !isNaN(Number(idParam)) ? Number(idParam) : idParam;
         this.loadProductData(id);
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = !isNaN(Number(idParam)) ? Number(idParam) : idParam;
        this.loadProductData(id);
        
        // Se a lista estiver vazia, força o carregamento
        if (this.productService.products().length === 0) {
           this.productService.loadProducts();
        }
      }
    });
  }

  private loadProductData(id: number | string) {
    this.product = this.productService.getProductById(id);
    if (this.product) {
      this.loadProductMedia(id);
      this.startAutoSlide();
    }
  }

  /**
   * Identifica se a URL é de um vídeo baseado na extensão
   */
  private isVideo(url: string): boolean {
    if (!url) return false;
    // Se for base64, assume imagem por enquanto
    if (url.startsWith('data:')) return false;
    
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  }

  private loadProductMedia(id: number | string): void {
    if (!this.product) return;

    let extraMedia: string[] | undefined;
    
    // Só busca mídia extra se for ID numérico (produtos hardcoded)
    if (typeof id === 'number') {
      extraMedia = this.productExtraImages[id];
    }

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
  
  get currentImage(): string {
    return this.currentItem?.url || '';
  }
  
  get images(): string[] {
    return this.carouselItems.map(i => i.url);
  }

  setMainImage(index: number): void {
    this.currentImageIndex = index;
    this.pauseAutoSlide();
    this.checkVideoAutoPlay();
  }

  nextImage(): void {
    if (this.carouselItems.length <= 1) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselItems.length;
    this.checkVideoAutoPlay();
  }

  prevImage(): void {
    if (this.carouselItems.length <= 1) return;
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
    if (this.carouselItems.length <= 1) return;

    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused) {
        
        if (this.currentItem.type === 'video' && this.videoPlayer?.nativeElement.paused === false) {
           return;
        }
        
        this.nextImage();
      }
    }, 5000);
  }

  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  private pauseAutoSlide(): void {
    this.isPaused = true;
    this.stopAutoSlide();
    
    if (this.resumeSlideTimeout) {
      clearTimeout(this.resumeSlideTimeout);
    }
    
    this.resumeSlideTimeout = setTimeout(() => {
      this.isPaused = false;
      this.startAutoSlide();
    }, 10000);
  }

  private checkVideoAutoPlay(): void {
    setTimeout(() => {
      if (this.currentItem.type === 'video' && this.videoPlayer) {
        this.videoPlayer.nativeElement.play().catch(e => console.log('Autoplay bloqueado:', e));
      }
    }, 100);
  }

  // --- Métodos de Interação ---

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  incrementQuantity(): void {
    this.quantity.update(q => q + 1);
  }

  decrementQuantity(): void {
    this.quantity.update(q => q > 1 ? q - 1 : 1);
  }

  adicionarAoCarrinho(): void {
    if (this.product && this.selectedSize) {
      this.carrinhoService.adicionar(this.product, this.selectedSize, this.quantity());
      alert('Produto adicionado ao carrinho!');
    }
  }

  comprarAgora(): void {
    if (this.product && this.selectedSize) {
      this.carrinhoService.adicionar(this.product, this.selectedSize, this.quantity());
      // Aqui poderia navegar para o carrinho, ex:
      // this.router.navigate(['/carrinho']);
      alert('Redirecionando para checkout...');
    }
  }

  voltar(): void {
    this.location.back();
  }
}
