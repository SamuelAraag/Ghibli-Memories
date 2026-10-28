import { Component, ElementRef, HostListener, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Movie } from '../../models/movie.model';

@Component({
    selector: 'app-card-movie',
    imports: [],
    templateUrl: './card-movie.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './card-movie.component.scss'
})

export class CardMovieComponent {
  @Input() movie?: Movie;

  ativo = false;

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
    if (window.matchMedia('(hover: hover)').matches) return;
    this.ativo = !this.ativo;
  }

  aoFocar(botao: HTMLElement) {
    if (botao.matches(':focus-visible')) this.ativo = true;
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
