import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Movie } from './models/movie.model';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  movies: Movie[] = [];
  constructor(private http: HttpClient){}

  async ngOnInit() {
    const url = "https://ghibliapi.vercel.app/films";
    this.movies = await lastValueFrom(this.http.get<Movie[]>(url));
  }
  title = 'ghibli-memories';
}
