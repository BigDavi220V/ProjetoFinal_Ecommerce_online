import { Component } from '@angular/core';
import { Product } from '../../models/product.model'; // Import do Modelo
import { ProductCardComponent } from '../../components/card-produtos/card-produtos.component'; // Import do Card

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductCardComponent], // Importante: Declarar o card aqui
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css']
})
export class ProductsComponent {
  // Lista de dados [cite: 49]
  products: Product[] = [
    { id: 1, name: 'LEG ROXO', price: 100.00, image: 'assets/Modelo_01.png' },
    { id: 2, name: 'LEG VERDE ÁGUA', price: 100.00, image: 'assets/Modelo_02.png' },
    { id: 3, name: 'LEG AZUL ESCURO', price: 100.00, image: 'assets/Modelo_03.png' },
    { id: 4, name: 'LEG VERMELHO ESCURO', price: 100.00, image: 'assets/Modelo_04.png' },
    { id: 5, name: 'LEG VERMELHO CLARO', price: 100.00, image: 'assets/Modelo_05.png' },
    { id: 6, name: 'LEG VINHO', price: 100.00, image: 'assets/assets IA/Modelo_vermelho01.png' },
    { id: 7, name: 'LEG PRETO', price: 100.00, image: 'assets/assets IA/Modelo_Preto01.png' },
    { id: 8, name: 'LEG TURQUESA', price: 100.00, image: 'assets/assets IA/Modelo_Azul_Turquesa01.png' },
    { id: 9, name: 'LEG MARINHO', price: 100.00, image: 'assets/assets IA/Modelo_Azul_Escuro01.png' },
  ];
}