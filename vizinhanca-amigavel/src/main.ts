import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('Iniciando bootstrap da aplicação...');

bootstrapApplication(App, appConfig)
  .then(() => {
    console.log('Aplicação inicializada com sucesso!');
  })
  .catch((err) => {
    console.error('Erro ao inicializar aplicação:', err);
    console.error('Stack trace:', err.stack);
    // Mostra erro na página caso o bootstrap falhe
    if (document.body) {
      document.body.innerHTML = `
        <div style="padding: 20px; font-family: Arial; color: red; background: white;">
          <h1>Erro ao carregar aplicação</h1>
          <p><strong>Erro:</strong> ${err.message || err}</p>
          <p><strong>Stack:</strong> ${err.stack || 'N/A'}</p>
          <p>Verifique o console para mais detalhes.</p>
        </div>
      `;
    }
  });
