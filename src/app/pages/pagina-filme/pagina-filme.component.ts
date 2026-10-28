import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Input, computed, signal } from '@angular/core';
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
export class PaginaFilmeComponent implements AfterViewChecked {
  private idAtual = signal('');
  private focou = false;

  @Input() set id(valor: string) {
    this.idAtual.set(valor);
    this.focou = false;
  }

  filme = computed(() => this.filmesService.buscar(this.idAtual()));

  constructor(
    public filmesService: FilmesService,
    private router: Router,
    private location: Location,
    private elemento: ElementRef<HTMLElement>
  ) {
    this.filmesService.carregarSeNecessario();
    window.scrollTo({ top: 0 });
  }

  ngAfterViewChecked() {
    if (this.focou || !this.filme()) return;
    this.elemento.nativeElement.querySelector<HTMLElement>('.titulo')?.focus({ preventScroll: true });
    this.focou = true;
  }

  voltar() {
    if (this.router.lastSuccessfulNavigation()?.previousNavigation) {
      this.location.back();
      return;
    }
    this.router.navigate(['/']);
  }
}
