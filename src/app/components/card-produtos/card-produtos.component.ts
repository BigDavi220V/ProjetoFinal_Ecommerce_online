import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model'; // Caminho corrigido

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-produtos.component.html',
  styleUrls: ['./card-produtos.component.css']
})
export class ProductCardComponent {
  // Angular 19 Signal Input
  product = input.required<Product>();

  // Formatação de preço
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }
}