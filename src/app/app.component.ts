import { Component, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren, QueryList, HostListener, ElementRef, ViewChild, DestroyRef, inject } from '@angular/core';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Movie } from './models/movie.model';
import { CardMovieComponent } from "./components/card-movie/card-movie.component";
import { BuscaRapidaComponent, AcaoRapida } from './components/busca-rapida/busca-rapida.component';
import { posicaoPopularidade } from './data/popularidade';
import { FilmesService } from './services/filmes.service';
import { CAMINHO_FILME, ehRotaFilme } from './app.routes';

type Ordem = 'famosos' | 'lancamento' | 'nota';
type Direcao = 'desc' | 'asc';

const DIRETORES_PRINCIPAIS = ['Hayao Miyazaki', 'Isao Takahata', 'Gorō Miyazaki'];
const OUTROS_DIRETORES = 'Outros';

@Component({
    selector: 'app-root',
    imports: [CardMovieComponent, BuscaRapidaComponent, RouterOutlet],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ghibli-memories';

  @ViewChildren(CardMovieComponent) cards!: QueryList<CardMovieComponent>;
  @ViewChild('titulo') titulo!: ElementRef<HTMLElement>;

  filmes = this.filmesService.filmes;
  estado = this.filmesService.estado;
  emRotaDetalhe = signal(ehRotaFilme(inject(Location).path()));
  ordem = signal<Ordem>('famosos');
  direcao = signal<Direcao>('desc');
  diretores = signal<Set<string>>(new Set());
  decadas = signal<Set<string>>(new Set());
  primeiraRenderizacao = signal(true);
  mostrarVoltarAoTopo = signal(false);

  esqueletos = Array.from({ length: 6 }, (_, indice) => indice);
  opcoesDiretor = [...DIRETORES_PRINCIPAIS, OUTROS_DIRETORES];
  opcoesDecada = ['1980', '1990', '2000', '2010', '2020'];

  temFiltro = computed(() => this.diretores().size > 0 || this.decadas().size > 0);

  filmesVisiveis = computed(() => {
    const diretores = this.diretores();
    const decadas = this.decadas();
    const lista = this.filmes().filter((filme) =>
      (!diretores.size || diretores.has(this.diretorDoFiltro(filme))) &&
      (!decadas.size || decadas.has(this.decadaDe(filme)))
    );
    return lista.sort(this.comparador());
  });

  textoContagem = computed(() => {
    const total = this.filmes().length;
    const visiveis = this.filmesVisiveis().length;
    const base = visiveis === 1 ? '1 filme' : `${visiveis} filmes`;
    return visiveis === total ? base : `${base} de ${total}`;
  });

  acoesRapidas = computed<AcaoRapida[]>(() => {
    const acoes: AcaoRapida[] = [
      { id: 'famosos', rotulo: 'Ordenar por mais famosos', icone: '★' },
      { id: 'recentes', rotulo: 'Ordenar por lançamento, mais recentes', icone: '↓' },
      { id: 'antigos', rotulo: 'Ordenar por lançamento, mais antigos', icone: '↑' },
    ];
    if (this.temFiltro()) acoes.push({ id: 'limpar', rotulo: 'Limpar filtros', icone: '✕' });
    return acoes;
  });

  private rolagemLista = 0;
  private idUltimoFilme = '';

  constructor(
    private filmesService: FilmesService,
    private detector: ChangeDetectorRef,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.lerUrl();
    this.filmesService.carregarSeNecessario();
    this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.sincronizarComUrl());
  }

  carregarFilmes() {
    this.filmesService.carregar();
  }

  abrirFilme(filme: Movie) {
    this.cards?.forEach((card) => card.desativar());
    this.rolagemLista = window.scrollY;
    this.idUltimoFilme = filme.id;
    this.filmesService.veioDaLista = true;
    this.router.navigate([CAMINHO_FILME, filme.id]);
  }

  @HostListener('window:scroll')
  aoRolar() {
    if (this.emRotaDetalhe()) return;
    const mostrar = window.scrollY > window.innerHeight * 0.8;
    if (mostrar !== this.mostrarVoltarAoTopo()) this.mostrarVoltarAoTopo.set(mostrar);
  }

  voltarAoTopo() {
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduzirMovimento ? 'auto' : 'smooth' });
    this.titulo.nativeElement.focus({ preventScroll: true });
  }

  rotuloDecada(decada: string): string {
    return `Anos ${decada.slice(2)}`;
  }

  rotuloLancamento(): string {
    return `Lançamento, ${this.direcao() === 'desc' ? 'mais recentes primeiro' : 'mais antigos primeiro'}`;
  }

  ordenarPor(ordem: Ordem) {
    this.aplicar(() => {
      if (ordem === 'lancamento' && this.ordem() === 'lancamento') {
        this.direcao.update((direcao) => direcao === 'desc' ? 'asc' : 'desc');
      }
      this.ordem.set(ordem);
    });
  }

  alternarDiretor(diretor: string) {
    this.aplicar(() => this.diretores.update((atual) => this.alternarItem(atual, diretor)));
  }

  alternarDecada(decada: string) {
    this.aplicar(() => this.decadas.update((atual) => this.alternarItem(atual, decada)));
  }

  limparFiltros() {
    this.aplicar(() => {
      this.diretores.set(new Set());
      this.decadas.set(new Set());
    });
  }

  executarAcao(id: string) {
    const acoes: Record<string, () => void> = {
      famosos: () => this.aplicar(() => this.ordem.set('famosos')),
      recentes: () => this.aplicar(() => { this.ordem.set('lancamento'); this.direcao.set('desc'); }),
      antigos: () => this.aplicar(() => { this.ordem.set('lancamento'); this.direcao.set('asc'); }),
      limpar: () => this.limparFiltros(),
    };
    acoes[id]?.();
  }

  irParaFilme(filme: Movie) {
    const visivel = this.filmesVisiveis().some((f) => f.id === filme.id);
    const destacar = () => this.cards.find((card) => card.movie?.id === filme.id)?.destacar();
    if (visivel) {
      destacar();
      return;
    }
    this.limparFiltros();
    setTimeout(destacar, 520);
  }

  private aplicar(mudanca: () => void) {
    this.primeiraRenderizacao.set(false);
    this.cards?.forEach((card) => card.desativar());
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const atualizar = () => {
      mudanca();
      this.gravarUrl();
      this.detector.detectChanges();
    };
    if (!document.startViewTransition || reduzirMovimento) {
      atualizar();
      return;
    }
    document.startViewTransition(atualizar);
  }

  private comparador(): (a: Movie, b: Movie) => number {
    const popularidade = (a: Movie, b: Movie) => posicaoPopularidade(a.id) - posicaoPopularidade(b.id);
    switch (this.ordem()) {
      case 'lancamento': {
        const sinal = this.direcao() === 'desc' ? -1 : 1;
        return (a, b) => sinal * (Number(a.release_date) - Number(b.release_date)) || a.title.localeCompare(b.title);
      }
      case 'nota':
        return (a, b) => Number(b.rt_score) - Number(a.rt_score) || popularidade(a, b);
      default:
        return popularidade;
    }
  }

  private decadaDe(filme: Movie): string {
    return String(Math.floor(Number(filme.release_date) / 10) * 10);
  }

  private diretorDoFiltro(filme: Movie): string {
    return DIRETORES_PRINCIPAIS.includes(filme.director) ? filme.director : OUTROS_DIRETORES;
  }

  private alternarItem(conjunto: Set<string>, valor: string): Set<string> {
    const novo = new Set(conjunto);
    novo.has(valor) ? novo.delete(valor) : novo.add(valor);
    return novo;
  }

  private sincronizarComUrl() {
    const estavaNoDetalhe = this.emRotaDetalhe();
    const noDetalhe = ehRotaFilme(this.router.url);
    this.emRotaDetalhe.set(noDetalhe);
    if (estavaNoDetalhe && !noDetalhe) {
      this.detector.detectChanges();
      window.scrollTo({ top: this.rolagemLista });
      this.focarCardDoUltimoFilme();
    }
  }

  private focarCardDoUltimoFilme() {
    this.cards?.find((card) => card.movie?.id === this.idUltimoFilme)?.focar();
  }

  private lerUrl() {
    const parametros = new URLSearchParams(window.location.search);
    const ordem = parametros.get('ordem');
    if (ordem === 'lancamento' || ordem === 'nota') this.ordem.set(ordem);
    if (parametros.get('direcao') === 'asc') this.direcao.set('asc');
    const diretores = parametros.getAll('diretor').filter((d) => this.opcoesDiretor.includes(d));
    const decadas = parametros.getAll('decada').filter((d) => this.opcoesDecada.includes(d));
    this.diretores.set(new Set(diretores));
    this.decadas.set(new Set(decadas));
  }

  private gravarUrl() {
    const parametros = new URLSearchParams();
    if (this.ordem() !== 'famosos') parametros.set('ordem', this.ordem());
    if (this.ordem() === 'lancamento') parametros.set('direcao', this.direcao());
    this.diretores().forEach((d) => parametros.append('diretor', d));
    this.decadas().forEach((d) => parametros.append('decada', d));
    const busca = parametros.toString();
    history.replaceState(history.state, '', busca ? `?${busca}` : window.location.pathname);
  }
}
