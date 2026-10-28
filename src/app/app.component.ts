import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { Movie } from './models/movie.model';
import { CardMovieComponent } from "./components/card-movie/card-movie.component";

type EstadoCarregamento = 'carregando' | 'pronto' | 'erro';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CardMovieComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ghibli-memories';

  filmes = signal<Movie[]>([]);
  estado = signal<EstadoCarregamento>('carregando');
  esqueletos = Array.from({ length: 6 }, (_, indice) => indice);

  constructor(private http: HttpClient){}

  ngOnInit() {
    this.carregarFilmes();
  }

  carregarFilmes() {
    const urlApiGhibli = "https://ghibliapi.vercel.app/films";
    this.estado.set('carregando');
    this.http.get<Movie[]>(urlApiGhibli)
    .pipe(
      map((movies: Movie[]) => this.ordenarPorNota(movies))
    )
    .subscribe({
      next: (movies) => {
        this.filmes.set(movies);
        this.estado.set('pronto');
      },
      error: () => this.estado.set('erro')
    });
  }

  private ordenarPorNota(movies: Movie[]): Movie[] {
    return [...movies].sort((a, b) =>
      Number(b.rt_score) - Number(a.rt_score)
    );
  }
}
