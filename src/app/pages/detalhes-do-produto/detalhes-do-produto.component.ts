import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-detalhes-do-produto',
  standalone: true,
  imports: [CommonModule], // Importante: CommonModule necessário para diretivas básicas
  templateUrl: './detalhes-do-produto.component.html',
  styleUrl: './detalhes-do-produto.component.css'
})
export class DetalhesDoProdutoComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private productService = inject(ProductService);
  private carrinhoService = inject(CarrinhoService);

  product?: Product;

  // Opções de tamanho disponíveis
  sizes: string[] = ['P', 'M', 'G', 'GG'];
  
  // Estado do tamanho selecionado pelo usuário
  selectedSize: string | null = null;

  ngOnInit(): void {
    // Pega o ID da rota e busca o produto correspondente
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.product = this.productService.getProductById(id);
    }
  }

  // Método para selecionar um tamanho ao clicar
  selectSize(size: string): void {
    this.selectedSize = size;
  }

  adicionarAoCarrinho(): void {
    if (!this.product) return;

    // Validação: obriga a seleção do tamanho
    if (!this.selectedSize) {
      alert('Por favor, selecione um tamanho antes de adicionar ao carrinho.');
      return;
    }

    // Lógica de adicionar ao carrinho (com tamanho)
    console.log(`Adicionando ${this.product.name}, Tamanho: ${this.selectedSize}`);
    
    // CORREÇÃO: Passando o produto E o tamanho selecionado
    // O "!" garante ao TS que selectedSize não é nulo (já checado no if acima)
    this.carrinhoService.adicionar(this.product, this.selectedSize!);
    
    alert(`${this.product.name} (Tamanho: ${this.selectedSize}) foi adicionado ao carrinho!`);
  }

  comprarAgora(): void {
    if (!this.selectedSize) {
      alert('Selecione um tamanho para continuar.');
      return;
    }
    this.adicionarAoCarrinho();
    // Exemplo: Redirecionar para o carrinho ou checkout
    // this.router.navigate(['/carrinho']);
  }

  voltar(): void {
    this.location.back();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }
}