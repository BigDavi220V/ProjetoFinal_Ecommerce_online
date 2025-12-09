export interface Product {
  descrição?: string;
  id: number | string;
  name: string;
  price: number;
  image: string;
  description?: string;
  specifications?: any;
  category_id?: number;
  stock?: number;
  sku?: string;
  tags?: string[];
  // Campos para compatibilidade com API em português (opcionais)
  nome?: string;
  preco?: number;
  estoque?: number;
  imagem_url?: string;
  images?: string[];
  isLocal?: boolean;
}
