import { Routes } from '@angular/router';
import { DetalhesDoProdutoComponent } from './pages/detalhes-do-produto/detalhes-do-produto.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: 'login',
        title: 'Login | IZZI FITNESS',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },

    {
        path: 'cadastro',
        title: 'Cadastro | IZZI FITNESS',
        loadComponent: () => import('./pages/cadastro/cadastro.component').then(m => m.CadastroComponent) // Assumindo que você criará este
    },

    {
        path: 'forgot-password',//redefinir-password
        title: 'Redefinir senha | IZZI FITNESS',
        loadComponent: () => import('./pages/redefinir-password/redefinir-password.component').then(m => m.RedefinirPasswordComponent) // Assumindo que você criará este
    },

    {
        path: 'home',
        title: 'Inicio | IZZI FITNESS',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) // Assumindo que você criará este
    },
    {
        path: 'produtos',
        title: 'Produtos | IZZI FITNESS',
        loadComponent: () => import('./pages/produtos/produtos.component').then(m => m.ProductsComponent) // Assumindo que você criará este
    },

    { 
        path: 'produto/:id', 
        component: DetalhesDoProdutoComponent,
        title: 'Detalhes do Produto' 
      },

      {
        path: 'carrinho',
        title: 'Carrinho | IZZI FITNESS',
        loadComponent: () => import('./pages/carrinho/carrinho.component').then(m => m.CarrinhoComponent) // Assumindo que você criará este
      },

      {
        path: 'contato',
        title: 'Contato | IZZI FITNESS',
        loadComponent: () => import('./pages/contato/contato.component').then(m => m.ContactComponent) // Assumindo que você criará este
      },

      {
        path: 'perfil',
        title: 'Perfil | IZZI FITNESS',
        loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
      },

];