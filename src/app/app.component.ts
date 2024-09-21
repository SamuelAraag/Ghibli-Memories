import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Movie } from './models/movie.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  movies: Movie[] = [];
  constructor(private http: HttpClient){}
  title = 'ghibli-memories';

  async ngOnInit() {
    const url = "https://ghibliapi.vercel.app/films";
    this.movies = await lastValueFrom(this.http.get<Movie[]>(url));
    console.log(this.movies[0])

    this.updateProgressBar();
  }

  updateProgressBar(nota?: string) {
    let notaConvertida = Number(nota) || 0;
    const progressBar = document.getElementById('progress-bar');
    
    // Atualizando a largura do progresso
    if(progressBar){
      progressBar.style.width = `${notaConvertida}%`;
      
      // Mudando a cor com base no valor da nota
      const greenValue = Math.floor((notaConvertida / 100) * 255);
      const redValue = 255 - greenValue;
      progressBar.style.backgroundColor = `rgb(${redValue}, ${greenValue}, 0)`;
    }

    return true;
  }
}
