import { ApplicationConfig } from '@angular/core';
import { ActivatedRouteSnapshot, provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

const ehPaginaFilme = (rota: ActivatedRouteSnapshot) => rota.firstChild?.routeConfig?.path === 'filme/:id';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from, to }) => {
          const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (reduzirMovimento || ehPaginaFilme(from) === ehPaginaFilme(to)) transition.skipTransition();
        }
      })
    ),
    provideHttpClient(withFetch())
  ]
};
