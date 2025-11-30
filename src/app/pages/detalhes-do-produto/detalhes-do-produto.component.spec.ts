import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetalhesDoProdutoComponent } from './detalhes-do-produto.component';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { of } from 'rxjs';

describe('DetalhesDoProdutoComponent', () => {
  let component: DetalhesDoProdutoComponent;
  let fixture: ComponentFixture<DetalhesDoProdutoComponent>;
  let mockProductService: any;
  let mockCarrinhoService: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Mock do ProductService
    mockProductService = {
      getProductById: jasmine.createSpy('getProductById').and.returnValue({
        id: 6,
        name: 'LEG VINHO',
        price: 100.00,
        image: 'assets/assets IA/Modelo_vermelho01.png'
      })
    };

    // Mock do CarrinhoService
    mockCarrinhoService = {
      adicionar: jasmine.createSpy('adicionar')
    };

    // Mock do ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: () => '6' // Simula ID 6 que tem vídeo
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [DetalhesDoProdutoComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: CarrinhoService, useValue: mockCarrinhoService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalhesDoProdutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product media including video', () => {
    // ID 6 tem vídeo mapeado no componente
    expect(component.carouselItems.length).toBeGreaterThan(0);
    // Verifica se algum item é vídeo
    const hasVideo = component.carouselItems.some(item => item.type === 'video');
    expect(hasVideo).toBeTrue();
  });

  it('should identify video files correctly', () => {
    const videoUrl = 'assets/videos_marketing/Leg_vermelho.mp4';
    const imageUrl = 'assets/assets IA/Modelo_vermelho01.png';
    
    // Acessando método privado via cast para 'any' ou testando indiretamente via loadProductMedia
    // Como loadProductMedia é privado, testamos o resultado em carouselItems
    
    const videoItem = component.carouselItems.find(i => i.url.endsWith('.mp4'));
    const imageItem = component.carouselItems.find(i => i.url.endsWith('.png'));
    
    expect(videoItem?.type).toBe('video');
    expect(imageItem?.type).toBe('image');
  });

  it('should cycle through slides', () => {
    const initialIndex = component.currentImageIndex;
    component.nextImage();
    expect(component.currentImageIndex).not.toBe(initialIndex);
    
    component.prevImage();
    expect(component.currentImageIndex).toBe(initialIndex);
  });

  it('should handle image error fallback', () => {
    const index = 0;
    component.handleImageError(index);
    expect(component.carouselItems[index].url).toContain('Logo_IZ_sem_nome.jpeg');
    expect(component.carouselItems[index].type).toBe('image');
  });

  it('should pause auto slide on interaction', fakeAsync(() => {
    component.pauseAutoSlide();
    expect(component.isPaused).toBeTrue();
    
    // Avança 8 segundos
    tick(8000);
    expect(component.isPaused).toBeFalse();
  }));
});
