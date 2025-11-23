import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rotas de autenticação não devem ser renderizadas no servidor para evitar problemas com Supabase
  {
    path: 'auth/**',
    renderMode: RenderMode.Client
  },
  // Outras rotas renderizadas no servidor
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
