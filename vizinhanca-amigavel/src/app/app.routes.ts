import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { verificationGuard } from './core/guards/verification.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => {
          return import('./features/auth/login/login.component')
            .then(m => m.LoginComponent)
            .catch(err => {
              console.error('Erro ao carregar LoginComponent:', err);
              // Retorna um componente de erro ao invés de quebrar
              return import('./features/auth/login/login.component').then(m => m.LoginComponent).catch(() => {
                // Fallback: retorna um componente simples de erro
                throw new Error('Não foi possível carregar o componente de login. Verifique a conexão com o servidor.');
              });
            });
        }
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
      },
      {
        path: 'verification',
        loadComponent: () => import('./features/auth/verification/verification.component').then(m => m.VerificationComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [verificationGuard],
    children: [
      {
        path: 'mural',
        loadComponent: () => import('./features/mural/feed/feed.component').then(m => m.FeedComponent)
      },
      {
        path: 'grupos',
        loadComponent: () => import('./features/grupos/lista/lista-grupos.component').then(m => m.ListaGruposComponent)
      },
      {
        path: 'mensagens',
        loadComponent: () => import('./features/mensagens/lista-conversas/lista-conversas.component').then(m => m.ListaConversasComponent)
      },
      {
        path: 'achados-perdidos',
        loadComponent: () => import('./features/achados-perdidos/lista/lista.component').then(m => m.ListaComponent)
      },
      {
        path: 'encomendas',
        loadComponent: () => import('./features/encomendas/lista/lista-encomendas.component').then(m => m.ListaEncomendasComponent)
      },
      {
        path: 'ajuda-mutua',
        loadComponent: () => import('./features/ajuda-mutua/lista/lista-ajuda-mutua.component').then(m => m.ListaAjudaMutuaComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./features/agenda/lista/lista-agenda.component').then(m => m.ListaAgendaComponent)
      },
      {
        path: 'mapa',
        loadComponent: () => import('./features/mapa/mapa-colaborativo/mapa-colaborativo.component').then(m => m.MapaColaborativoComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/meu-perfil/meu-perfil.component').then(m => m.MeuPerfilComponent)
      },
      {
        path: 'sem-comunidade',
        loadComponent: () => import('./features/condominio/sem-comunidade/sem-comunidade.component').then(m => m.SemComunidadeComponent)
      },
      {
        path: 'entrar-com-convite',
        loadComponent: () => import('./features/condominio/entrar-com-convite/entrar-com-convite.component').then(m => m.EntrarComConviteComponent)
      },
      {
        path: 'condominio/criar',
        loadComponent: () => import('./features/condominio/criar/condominio-onboarding.component').then(m => m.CondominioOnboardingComponent)
      },
      {
        path: 'gerar-convite',
        loadComponent: () => import('./features/condominio/gerar-convite/gerar-convite.component').then(m => m.GerarConviteComponent)
      },
      {
        path: 'convite/:id',
        loadComponent: () => import('./features/condominio/convite/convite-condominio.component').then(m => m.ConviteCondominioComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
