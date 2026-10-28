import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Movie } from '../../models/movie.model';

@Component({
    selector: 'app-detalhe-filme',
    imports: [],
    templateUrl: './detalhe-filme.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './detalhe-filme.component.scss'
})
export class DetalheFilmeComponent {
  @Input({ required: true }) filme!: Movie;
  @Input() idTitulo = 'titulo-filme';
  @Input() nivelTitulo: 1 | 2 = 1;
  @Input() comTransicao = true;
}
