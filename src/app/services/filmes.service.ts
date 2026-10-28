import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Movie } from '../models/movie.model';

export type EstadoCarregamento = 'carregando' | 'pronto' | 'erro';

@Injectable({ providedIn: 'root' })
export class FilmesService {
  private readonly urlApiGhibli = 'https://ghibliapi.vercel.app/films';

  filmes = signal<Movie[]>([]);
  estado = signal<EstadoCarregamento>('carregando');

  constructor(private http: HttpClient) {}

  private emAndamento = false;

  veioDaLista = false;

  private capasCarregadas = new Set<string>();

  carregar() {
    if (this.emAndamento) return;
    this.emAndamento = true;
    this.estado.set('carregando');
    this.http.get<Movie[]>(this.urlApiGhibli).subscribe({
      next: (filmes) => {
        this.emAndamento = false;
        this.filmes.set(filmes);
        this.estado.set('pronto');
        this.preCarregarCapas(filmes);
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

  private preCarregarCapas(filmes: Movie[]) {
    const fila = filmes
      .map((filme) => filme.movie_banner)
      .filter((url) => url && !this.capasCarregadas.has(url));

    const proxima = () => {
      const url = fila.shift();
      if (!url) return;
      const imagem = new Image();
      imagem.onload = () => {
        this.capasCarregadas.add(url);
        proxima();
      };
      imagem.onerror = () => proxima();
      imagem.src = url;
    };

    if ('requestIdleCallback' in window) requestIdleCallback(proxima);
    else setTimeout(proxima);
  }

  buscar(id: string): Movie | undefined {
    return this.filmes().find((filme) => filme.id === id);
  }
}
