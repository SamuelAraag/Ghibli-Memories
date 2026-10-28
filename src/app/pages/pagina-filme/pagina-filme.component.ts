import { ChangeDetectionStrategy, Component, ElementRef, Injector, Input, afterNextRender, computed, effect, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FilmesService } from '../../services/filmes.service';
import { DetalheFilmeComponent } from '../../components/detalhe-filme/detalhe-filme.component';

@Component({
    selector: 'app-pagina-filme',
    imports: [DetalheFilmeComponent],
    templateUrl: './pagina-filme.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './pagina-filme.component.scss'
})
export class PaginaFilmeComponent {
  private idAtual = signal('');

  @Input() set id(valor: string) {
    this.idAtual.set(valor);
  }

  filme = computed(() => this.filmesService.buscar(this.idAtual()));
  pronto = computed(() => this.filmesService.estado() !== 'carregando');

  constructor(
    public filmesService: FilmesService,
    private router: Router,
    private location: Location,
    private elemento: ElementRef<HTMLElement>,
    private injector: Injector
  ) {
    this.filmesService.carregarSeNecessario();
    window.scrollTo({ top: 0 });
    effect(() => {
      this.idAtual();
      if (!this.pronto()) return;
      afterNextRender(() => {
        this.elemento.nativeElement.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
      }, { injector: this.injector });
    });
  }

  voltar() {
    if (this.filmesService.veioDaLista) {
      this.filmesService.veioDaLista = false;
      this.location.back();
      return;
    }
    this.router.navigate(['/']);
  }
}
