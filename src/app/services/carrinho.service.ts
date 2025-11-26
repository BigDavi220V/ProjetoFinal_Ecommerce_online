import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  // Signal principal: Lista de itens do carrinho
  private items = signal<CartItem[]>([]);

  // Computed: Quantidade total de itens (para o badge do ícone do carrinho)
  quantidadeTotal = computed(() => 
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );

  // Computed: Valor total da compra
  valorTotal = computed(() => 
    this.items().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  // Expor sinal de leitura para os componentes
  getItems() {
    return this.items.asReadonly();
  }

  /**
   * Adiciona um produto ao carrinho.
   * Se o produto com o mesmo ID e TAMANHO já existir, aumenta a quantidade.
   */
  adicionar(produto: Product, tamanho: string) {
    this.items.update(itensAtuais => {
      const index = itensAtuais.findIndex(
        item => item.product.id === produto.id && item.size === tamanho
      );

      if (index !== -1) {
        // Item já existe, clonamos o array e atualizamos a quantidade do item específico
        const novosItens = [...itensAtuais];
        novosItens[index] = { 
          ...novosItens[index], 
          quantity: novosItens[index].quantity + 1 
        };
        return novosItens;
      } else {
        // Item novo
        return [...itensAtuais, { product: produto, quantity: 1, size: tamanho }];
      }
    });
  }

  // Remove um item completamente
  removerItem(produtoId: number, tamanho: string) {
    this.items.update(itens => 
      itens.filter(item => !(item.product.id === produtoId && item.size === tamanho))
    );
  }

  // Incrementa a quantidade
  incrementarQuantidade(produtoId: number, tamanho: string) {
    this.items.update(itens => 
      itens.map(item => 
        (item.product.id === produtoId && item.size === tamanho)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  // Decrementa a quantidade (se for 1, remove o item)
  decrementarQuantidade(produtoId: number, tamanho: string) {
    this.items.update(itens => {
      return itens.map(item => {
        if (item.product.id === produtoId && item.size === tamanho) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove itens com quantidade 0
    });
  }

  limparCarrinho() {
    this.items.set([]);
  }
}