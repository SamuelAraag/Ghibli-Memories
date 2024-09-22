import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { Movie } from './models/movie.model';
import { CommonModule } from '@angular/common';
import { CardMovieComponent } from "./components/card-movie/card-movie.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule, CardMovieComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ghibli-memories';

  $movies: Observable<Movie[]> = new Observable();

  constructor(private http: HttpClient){}

  ngOnInit() {
    const urlApiGhibli = "https://ghibliapi.vercel.app/films";
    this.$movies = this.http.get<Movie[]>(urlApiGhibli);
  }
}