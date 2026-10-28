import { Routes } from '@angular/router';
import { PaginaFilmeComponent } from './pages/pagina-filme/pagina-filme.component';

export const routes: Routes = [
  { path: 'filme/:id', component: PaginaFilmeComponent },
  { path: '', children: [] },
  { path: '**', redirectTo: '' }
];
