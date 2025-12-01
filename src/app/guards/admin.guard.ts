import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  if (typeof window !== 'undefined' && localStorage) {
      const userId = localStorage.getItem('user_id');
      if (userId) {
          // TODO: Add proper role check here
          return true;
      }
  }
  
  router.navigate(['/login']);
  return false;
};
