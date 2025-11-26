import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.css']
})
export class CarrinhoComponent {
  // Injetando o serviço (público para ser acessado no HTML)
  carrinhoService = inject(CarrinhoService);
  
  // Acessando os signals do serviço
  cartItems = this.carrinhoService.getItems();
  total = this.carrinhoService.valorTotal;

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }

  increaseQty(id: number, size: string) {
    this.carrinhoService.incrementarQuantidade(id, size);
  }

  decreaseQty(id: number, size: string) {
    this.carrinhoService.decrementarQuantidade(id, size);
  }

  removeItem(id: number, size: string) {
    this.carrinhoService.removerItem(id, size);
  }
}