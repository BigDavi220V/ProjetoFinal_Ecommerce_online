import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Lista estática de produtos
  private staticProducts: Product[] = [
    { id: 1, name: 'LEG ROXO', price: 100.00, image: 'assets/Modelo_01.png' },
    { id: 2, name: 'LEG VERDE ÁGUA', price: 100.00, image: 'assets/Modelo_02.png' },
    { id: 3, name: 'LEG AZUL ESCURO', price: 100.00, image: 'assets/Modelo_03.png' },
    { id: 4, name: 'LEG VERMELHO ESCURO', price: 100.00, image: 'assets/Modelo_04.png' },
    { id: 5, name: 'LEG VERMELHO CLARO', price: 100.00, image: 'assets/Modelo_05.png' },
    { id: 6, name: 'LEG VINHO', price: 100.00, image: 'assets/assets IA/Modelo_vermelho01.png' },
    { id: 7, name: 'LEG PRETO', price: 100.00, image: 'assets/assets IA/Modelo_Preto01.png' },
    { id: 8, name: 'LEG TURQUESA', price: 100.00, image: 'assets/assets IA/Modelo_Azul_Turquesa01.png' },
    { id: 9, name: 'LEG MARINHO', price: 100.00, image: 'assets/assets IA/Modelo_Azul_Escuro01.png' },
    { 
      id: 10, 
      name: 'LEG BLACK', 
      price: 100.00, 
      image: 'assets/10_card/Modelo_01.png',
      description: 'A Legging Black Basic é a peça essencial que não pode faltar no seu guarda-roupa fitness. Com tecnologia de compressão inteligente, ela modela o corpo sem apertar, garantindo conforto absoluto durante seus treinos mais intensos ou no uso casual do dia a dia. O tecido de alta opacidade garante zero transparência, permitindo agachamentos com total segurança.',
      specifications: {
        material: 'Poliamida de Alta Performance',
        composition: '84% Poliamida, 16% Elastano',
        weight: '280g',
        dimensions: 'P, M, G, GG',
        origin: 'Nacional',
        warranty: 'Contra defeitos de fabricação (30 dias)'
      }
    },
  ];

  // Signal público que contém a lista completa de produtos (estáticos + locais)
  products = signal<Product[]>([]);

  constructor() {
    this.loadProducts();
  }

  // Carrega produtos estáticos e mescla com os locais do localStorage
  loadProducts() {
    // Verifica se estamos no browser antes de acessar localStorage
    let localProducts: Product[] = [];
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('local_products');
      localProducts = stored ? JSON.parse(stored) : [];
    }
    
    // Normaliza produtos estáticos para garantir compatibilidade de campos (Português/Inglês)
    const staticWithCompat = this.staticProducts.map(p => ({
        ...p,
        nome: p.name,
        preco: p.price,
        imagem_url: p.image,
        estoque: p.stock || 100 // Estoque padrão para itens estáticos
    }));

    this.products.set([...staticWithCompat, ...localProducts]);
  }

  // Retorna o valor atual do signal
  getProducts(): Product[] {
    return this.products();
  }

  // Busca um produto específico pelo ID (suporta number e string)
  getProductById(id: number | string): Product | undefined {
    // Usa == para permitir comparação entre string '1' e number 1
    return this.products().find(p => p.id == id);
  }
}
