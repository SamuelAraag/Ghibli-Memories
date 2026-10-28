import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Movie } from '../../models/movie.model';
import { normalizarTexto } from '../../util/texto';

@Component({
    selector: 'app-card-movie',
    imports: [],
    templateUrl: './card-movie.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './card-movie.component.scss'
})

export class CardMovieComponent {
  @Input() movie?: Movie;
  @Input() termoBusca = '';
  @Output() abrir = new EventEmitter<Movie>();

  ativo = false;

  trechoTitulo(): { antes: string; destaque: string; depois: string } {
    const titulo = this.movie?.title ?? '';
    const termo = normalizarTexto(this.termoBusca);
    if (!termo) return { antes: titulo, destaque: '', depois: '' };
    const indice = normalizarTexto(titulo).indexOf(termo);
    if (indice < 0) return { antes: titulo, destaque: '', depois: '' };
    const tamanho = this.termoBusca.trim().length;
    return { antes: titulo.slice(0, indice), destaque: titulo.slice(indice, indice + tamanho), depois: titulo.slice(indice + tamanho) };
  }


  constructor(private elemento: ElementRef<HTMLElement>, private detector: ChangeDetectorRef) {}

  @HostListener('pointerenter', ['$event'])
  aoEntrarPonteiro(evento: PointerEvent) {
    if (evento.pointerType === 'mouse') this.ativo = true;
  }

  @HostListener('pointerleave', ['$event'])
  aoSairPonteiro(evento: PointerEvent) {
    if (evento.pointerType === 'mouse') this.ativo = false;
  }

  @HostListener('document:keydown.escape')
  desativar() {
    this.ativo = false;
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(evento: MouseEvent) {
    if (!this.elemento.nativeElement.contains(evento.target as Node) && !(evento.target as HTMLElement).closest('dialog')) this.ativo = false;
  }

  alternar() {
    if (this.movie) this.abrir.emit(this.movie);
  }

  aoFocar(botao: HTMLElement) {
    if (botao.matches(':focus-visible')) this.ativo = true;
  }

  focar() {
    this.elemento.nativeElement.querySelector<HTMLElement>('.card-action')?.focus({ preventScroll: true });
  }

  destacar() {
    const host = this.elemento.nativeElement;
    const poster = host.querySelector<HTMLElement>('.poster');
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });
    poster?.classList.remove('highlight');
    void poster?.offsetWidth;
    poster?.classList.add('highlight');
    setTimeout(() => {
      this.ativo = true;
      this.detector.detectChanges();
      host.querySelector<HTMLElement>('.card-action')?.focus({ preventScroll: true });
    }, 450);
  }
}
