import { Component, Input, input } from '@angular/core';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-card-movie',
  standalone: true,
  imports: [],
  templateUrl: './card-movie.component.html',
  styleUrl: './card-movie.component.scss'
})
export class CardMovieComponent {
  @Input() movie?: Movie;

  constructor(){
    this.updateProgressBar(this.movie?.rt_score);
  }

  updateProgressBar(nota?: string) {
    if(!nota) return;

    let notaConvertida = Number(nota) || 0;
    const progressBar = document.getElementById('progress-bar');
    
    if(progressBar){
      progressBar.style.width = `${notaConvertida}%`;
      
      const greenValue = Math.floor((notaConvertida / 100) * 255);
      const redValue = 255 - greenValue;
      progressBar.style.backgroundColor = `rgb(${redValue}, ${greenValue}, 0)`;
    }
  }
}
