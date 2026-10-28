import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Movie } from '../models/movie.model';
import { RANKING_POPULARIDADE } from '../data/popularidade';

export type EstadoCarregamento = 'carregando' | 'pronto' | 'erro';

@Injectable({ providedIn: 'root' })
export class FilmesService {
  private readonly urlApiGhibli = 'https://ghibliapi.vercel.app/films';

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
    const posicao = (filme: Movie) => {
      const indice = RANKING_POPULARIDADE.indexOf(filme.id);
      return indice === -1 ? Infinity : indice;
    };
    const fila = [...filmes]
      .sort((a, b) => posicao(a) - posicao(b))
      .map((filme) => filme.movie_banner)
      .filter(Boolean);

    const quandoOcioso = (acao: () => void) => {
      if ('requestIdleCallback' in window) requestIdleCallback(acao);
      else setTimeout(acao, 200);
    };

    const proxima = () => {
      const url = fila.shift();
      if (!url) return;
      const imagem = new Image();
      imagem.fetchPriority = 'low';
      imagem.onload = imagem.onerror = () => quandoOcioso(proxima);
      imagem.src = url;
    };

    quandoOcioso(proxima);
  }

  buscar(id: string): Movie | undefined {
    return this.filmes().find((filme) => filme.id === id);
  }
}
