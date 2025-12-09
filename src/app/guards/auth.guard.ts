import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Guard para proteger rotas que exigem autenticação.
 * Verifica se o usuário possui um ID de sessão válido no localStorage.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  // Verifica disponibilidade do localStorage (para SSR)
  if (userService.isAuthenticated()) {
    return true;
  }

  // Registrar tentativa de acesso não autorizado
  console.warn(`[AuthGuard] Acesso negado. Tentativa de navegação para: ${state.url}`);
    
  // Redirecionar para login com returnUrl para melhor UX (opcional, mas recomendado)
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url }});
};

/**
 * Guard para impedir que usuários logados acessem páginas de login/cadastro.
 */
export const unauthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);
   
  if (userService.isAuthenticated()) {
    // Redireciona para home se já estiver logado
    return router.createUrlTree(['/home']);
  }

  return true;
};