import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de Autenticação
 * Protege rotas que requerem usuário autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // No servidor (SSR), sempre permite para evitar travamentos
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Se já está na rota de login/signup, permite
  if (state.url === '/auth/login' || state.url === '/auth/signup') {
    return true;
  }

  // Se não autenticado, redireciona para login
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url },
      skipLocationChange: false
    });
    return false;
  }

  return true;
};

