import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { ehRotaFilme, routes } from './app.routes';

const ehWebKit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome\//.test(navigator.userAgent);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from, to }) => {
          const ehPaginaFilme = (rota: typeof from) => ehRotaFilme('/' + rota.firstChild?.url.map((s) => s.path).join('/'));
          const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (ehWebKit || reduzirMovimento || ehPaginaFilme(from) === ehPaginaFilme(to)) transition.skipTransition();
        }
      })
    ),
    provideHttpClient(withFetch())
  ]
};
