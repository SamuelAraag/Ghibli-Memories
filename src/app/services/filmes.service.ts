import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Movie } from '../models/movie.model';

export type EstadoCarregamento = 'carregando' | 'pronto' | 'erro';

@Injectable({ providedIn: 'root' })
export class FilmesService {
  private readonly urlApiGhibli = 'https://ghibliapi.dev/films';

  filmes = signal<Movie[]>([]);
  estado = signal<EstadoCarregamento>('carregando');

  constructor(private http: HttpClient) {}

  private emAndamento = false;

  veioDaLista = false;

  carregar() {
    if (this.emAndamento) return;
    this.emAndamento = true;
    this.estado.set('carregando');
    this.http.get<Movie[]>(this.urlApiGhibli).subscribe({
      next: (filmes) => {
        this.emAndamento = false;
        this.filmes.set(filmes);
        this.estado.set('pronto');
      },
      error: () => {
        this.emAndamento = false;
        this.estado.set('erro');
      }
    });
  }

  carregarSeNecessario() {
    if (this.estado() === 'pronto' && this.filmes().length) return;
    this.carregar();
  }

  buscar(id: string): Movie | undefined {
    return this.filmes().find((filme) => filme.id === id);
  }
}
