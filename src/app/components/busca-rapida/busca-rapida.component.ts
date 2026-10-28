import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { Movie } from '../../models/movie.model';
import { posicaoPopularidade } from '../../data/popularidade';

export interface AcaoRapida {
  id: string;
  rotulo: string;
  icone: string;
}

interface Opcao {
  chave: string;
  tipo: 'filme' | 'acao';
  filme?: Movie;
  acao?: AcaoRapida;
}

interface TrechoDestacado {
  antes: string;
  destaque: string;
  depois: string;
}

@Component({
    selector: 'app-busca-rapida',
    imports: [],
    templateUrl: './busca-rapida.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './busca-rapida.component.scss'
})
export class BuscaRapidaComponent {
  @Input() filmes: Movie[] = [];
  @Input() acoes: AcaoRapida[] = [];
  @Input() ativa = true;
  @Output() escolherFilme = new EventEmitter<Movie>();
  @Output() escolherAcao = new EventEmitter<string>();

  @ViewChild('dialogo') dialogo!: ElementRef<HTMLDialogElement>;
  @ViewChild('entrada') entrada!: ElementRef<HTMLInputElement>;
  @ViewChild('corpo') corpo!: ElementRef<HTMLElement>;

  ehMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  termo = signal('');
  filmesEncontrados = signal<Movie[]>([]);
  acoesEncontradas = signal<AcaoRapida[]>([]);
  selecionada = signal(0);
  opcoes = computed<Opcao[]>(() => [
    ...this.filmesEncontrados().map((filme): Opcao => ({ chave: `opcao-${filme.id}`, tipo: 'filme', filme })),
    ...this.acoesEncontradas().map((acao): Opcao => ({ chave: `acao-${acao.id}`, tipo: 'acao', acao })),
  ]);
  private espera?: ReturnType<typeof setTimeout>;

  @HostListener('document:keydown', ['$event'])
  aoTeclar(evento: KeyboardEvent) {
    if (!this.ativa) return;
    const alvo = evento.target as HTMLElement;
    const atalhoK = evento.key.toLowerCase() === 'k' && (this.ehMac ? evento.metaKey : evento.ctrlKey);
    const barra = evento.key === '/' && !this.aberto() && !['INPUT', 'TEXTAREA'].includes(alvo.tagName);
    if (!atalhoK && !barra) return;
    evento.preventDefault();
    this.aberto() ? this.fechar() : this.abrir();
  }

  aberto(): boolean {
    return this.dialogo?.nativeElement.open ?? false;
  }

  abrir() {
    if (this.aberto()) return;
    this.termo.set('');
    this.atualizarResultados();
    this.dialogo.nativeElement.showModal();
    this.corpo.nativeElement.scrollTop = 0;
    this.entrada.nativeElement.value = '';
    this.entrada.nativeElement.focus();
  }

  fechar() {
    if (this.aberto()) this.dialogo.nativeElement.close();
  }

  aoDigitar(valor: string) {
    clearTimeout(this.espera);
    this.espera = setTimeout(() => {
      this.termo.set(valor.trim());
      this.atualizarResultados();
    }, 80);
  }

  limpar() {
    this.entrada.nativeElement.value = '';
    this.termo.set('');
    this.atualizarResultados();
    this.entrada.nativeElement.focus();
  }

  aoTeclarNaEntrada(evento: KeyboardEvent) {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      this.fechar();
      return;
    }
    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      this.selecionar(this.selecionada() + 1);
    }
    if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      this.selecionar(this.selecionada() - 1);
    }
    const atual = this.opcoes()[this.selecionada()];
    if (evento.key === 'Enter' && atual) {
      evento.preventDefault();
      this.escolher(atual);
    }
  }

  aoClicarNoDialogo(evento: MouseEvent) {
    if (evento.target === this.dialogo.nativeElement) this.fechar();
  }

  escolher(opcao: Opcao) {
    this.fechar();
    if (opcao.filme) this.escolherFilme.emit(opcao.filme);
    if (opcao.acao) this.escolherAcao.emit(opcao.acao.id);
  }

  escolherPorChave(chave: string) {
    const opcao = this.opcoes().find((o) => o.chave === chave);
    if (opcao) this.escolher(opcao);
  }

  selecionarPorChave(chave: string) {
    const indice = this.opcoes().findIndex((opcao) => opcao.chave === chave);
    if (indice >= 0 && indice !== this.selecionada()) this.selecionada.set(indice);
  }

  idOpcaoAtiva(): string | null {
    return this.opcoes()[this.selecionada()]?.chave ?? null;
  }

  selecionar(indice: number) {
    const total = this.opcoes().length;
    if (!total) return;
    this.selecionada.set((indice + total) % total);
    const id = this.opcoes()[this.selecionada()].chave;
    queueMicrotask(() => document.getElementById(id)?.scrollIntoView({ block: 'nearest' }));
  }

  destacar(texto: string): TrechoDestacado {
    const termo = this.termo();
    const indice = this.normalizar(texto).indexOf(this.normalizar(termo));
    if (!termo || indice < 0) return { antes: texto, destaque: '', depois: '' };
    return {
      antes: texto.slice(0, indice),
      destaque: texto.slice(indice, indice + termo.length),
      depois: texto.slice(indice + termo.length),
    };
  }

  private atualizarResultados() {
    const termo = this.normalizar(this.termo());
    const porPopularidade = [...this.filmes].sort((a, b) => posicaoPopularidade(a.id) - posicaoPopularidade(b.id));
    this.filmesEncontrados.set(termo
      ? porPopularidade.filter((filme) =>
          [filme.title, filme.original_title, filme.original_title_romanised, filme.director, filme.release_date]
            .some((campo) => this.normalizar(campo ?? '').includes(termo)))
      : porPopularidade.slice(0, 5));
    this.acoesEncontradas.set(this.acoes.filter((acao) => !termo || this.normalizar(acao.rotulo).includes(termo)));
    this.selecionada.set(0);
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
}
