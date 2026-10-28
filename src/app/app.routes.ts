import { Routes } from '@angular/router';
import { PaginaFilmeComponent } from './pages/pagina-filme/pagina-filme.component';

export const CAMINHO_FILME = 'filme';

export const ehRotaFilme = (url: string) => url.startsWith(`/${CAMINHO_FILME}/`);

export const routes: Routes = [
  { path: `${CAMINHO_FILME}/:id`, component: PaginaFilmeComponent },
  { path: '', children: [] },
  { path: '**', redirectTo: '' }
];
