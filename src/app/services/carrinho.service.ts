import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  // Signal para armazenar a lista de produtos no carrinho
  // Inicia como um array vazio
  private carrinhoItems = signal<Product[]>([]);

  // Computed signal para saber a quantidade total de itens (para o Header)
  quantidadeItens = computed(() => this.carrinhoItems().length);

  // Computed signal para o valor total (para a página do carrinho)
  valorTotal = computed(() => {
    return this.carrinhoItems().reduce((acc, item) => acc + item.price, 0);
  });

  // Método para expor os itens (leitura)
  obterItens() {
    return this.carrinhoItems.asReadonly();
  }

  // Adicionar item ao carrinho
  adicionar(produto: Product) {
    this.carrinhoItems.update(itensAtuais => [...itensAtuais, produto]);
    console.log('Produto adicionado:', produto.name); // Debug
    // Aqui você poderia adicionar um Toast/Alerta visual
  }

  // Remover item (pelo índice ou id)
  remover(index: number) {
    this.carrinhoItems.update(itens => itens.filter((_, i) => i !== index));
  }
  
  // Limpar carrinho
  limpar() {
    this.carrinhoItems.set([]);
  }
}