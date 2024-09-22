import { Component, Input } from '@angular/core';
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
}
