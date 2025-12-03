import { Component, inject, OnInit } from '@angular/core';
import { ProductCardComponent } from '../../components/card-produtos/card-produtos.component';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductCardComponent, CommonModule],
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.css']
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  
  // Expose the signal directly
  products = this.productService.products;

  ngOnInit() {
    this.productService.loadProducts();
  }
}
