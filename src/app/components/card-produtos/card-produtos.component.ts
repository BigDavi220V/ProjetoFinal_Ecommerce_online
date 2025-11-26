import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';
// Não precisamos mais injetar o CarrinhoService aqui, pois a adição acontece na tela de detalhes

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-produtos.component.html',
  styleUrls: ['./card-produtos.component.css']
})
export class ProductCardComponent {
  private router = inject(Router);

  // Recebe o produto do componente pai
  product = input.required<Product>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }

  // Atualizado: Em vez de tentar adicionar sem tamanho, levamos para a tela de detalhes
  irParaDetalhes(): void {
    this.router.navigate(['/produto', this.product().id]);
  }
}