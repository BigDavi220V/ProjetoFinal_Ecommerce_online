import { Routes } from '@angular/router';
import { DetalhesDoProdutoComponent } from './pages/detalhes-do-produto/detalhes-do-produto.component';
import { adminGuard } from './guards/admin.guard';

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
        loadComponent: () => import('./pages/cadastro/cadastro.component').then(m => m.CadastroComponent)
    },
    {
        path: 'forgot-password',
        title: 'Redefinir senha | IZZI FITNESS',
        loadComponent: () => import('./pages/redefinir-password/redefinir-password.component').then(m => m.RedefinirPasswordComponent)
    },
    {
        path: 'home',
        title: 'Inicio | IZZI FITNESS',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'produtos',
        title: 'Produtos | IZZI FITNESS',
        loadComponent: () => import('./pages/produtos/produtos.component').then(m => m.ProductsComponent)
    },
    { 
        path: 'produto/:id', 
        component: DetalhesDoProdutoComponent,
        title: 'Detalhes do Produto' 
    },
    {
        path: 'carrinho',
        title: 'Carrinho | IZZI FITNESS',
        loadComponent: () => import('./pages/carrinho/carrinho.component').then(m => m.CarrinhoComponent)
    },
    {
        path: 'checkout',
        title: 'Finalizar Compra | IZZI FITNESS',
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
    },
    {
        path: 'contato',
        title: 'Contato | IZZI FITNESS',
        loadComponent: () => import('./pages/contato/contato.component').then(m => m.ContactComponent)
    },
    {
        path: 'perfil',
        title: 'Perfil | IZZI FITNESS',
        loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
    },

    // Admin Routes
    {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                title: 'Admin | Dashboard',
                loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'produtos',
                title: 'Admin | Produtos',
                loadComponent: () => import('./pages/admin/admin-products/admin-products.component').then(m => m.AdminProductsComponent)
            },
            {
                path: 'usuarios',
                title: 'Admin | Usuários',
                loadComponent: () => import('./pages/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
            },
            {
                path: 'pedidos',
                title: 'Admin | Pedidos',
                loadComponent: () => import('./pages/admin/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent)
            }
        ]
    }
];
