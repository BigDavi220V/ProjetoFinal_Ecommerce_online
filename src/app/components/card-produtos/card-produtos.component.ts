import { Component, input, inject } from '@angular/core';// [cite_start]// [cite: 27]
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { CarrinhoService } from '../../services/carrinho.service'; // Ajuste o caminho conforme criado

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-produtos.component.html',
  styleUrls: ['./card-produtos.component.css']
})
export class ProductCardComponent {
  // Injeção de dependências (Estilo Angular 19)
  private carrinhoService = inject(CarrinhoService);
  private router = inject(Router);

  product = input.required<Product>(); //[cite_start]// [cite: 28]

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);// [cite_start]// [cite: 29]
  }

  // Ação do botão Carrinho
  adicionarAoCarrinho(): void {
    this.carrinhoService.adicionar(this.product());
    alert(`${this.product().name} foi adicionado ao carrinho!`);
  }

  // Ação do botão Comprar
  comprarAgora(): void {
    // Navega para uma rota dinâmica, ex: /produto/5
    this.router.navigate(['/produto', this.product().id]);
  }
}