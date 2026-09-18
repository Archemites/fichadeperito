import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PROFISSOES, Profissao } from './data/professions';
import { CAMINHOS, Caminho, Trilha, No } from './data/paths';
import { WIKI_DATA, WikiTopic } from './data/wiki';

export type AtributoChave = 'vigor' | 'acuidade' | 'psicometria' | 'esoterismo' | 'razao';

export interface Atributos {
  vigor: number;
  acuidade: number;
  psicometria: number;
  esoterismo: number;
  razao: number;
}

export type AbaId = 'identidade' | 'atributos' | 'combate' | 'caminhos' | 'tabelas' | 'inventario' | 'magias';

const PONTOS_INICIAIS = 5;
const MIN_ATRIBUTO = -5;
const MAX_ATRIBUTO = 10;

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

// aceita formatos tipo "1d20", "2d15", "0"
function rollFormula(formula: string): number {
  const f = formula.trim().toLowerCase();
  if (f === '—' || f === '0' || f === '') return 0;
  const match = f.match(/^(\d+)d(\d+)$/);
  if (!match) return 0;
  const qty = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  let total = 0;
  for (let i = 0; i < qty; i++) total += rollDie(sides);
  return total;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  profissoes = PROFISSOES;

  // --- Integração MongoDB Atlas: Usuários & Peritos ---
  usuarioAtual = signal<string | null>(localStorage.getItem('limiar_usuario_ativo'));
  mostrarTelaLogin = signal<boolean>(!localStorage.getItem('limiar_usuario_ativo'));
  mostrarTelaPeritos = signal<boolean>(false);
  inputUsuario = signal('');
  usuariosCadastrados = signal<{ id: string; username: string }[]>([]);
  peritosDoUsuario = signal<any[]>([]);
  peritoIdAtual = signal<string | null>(localStorage.getItem('limiar_perito_ativo'));
  mensagemStatusBanco = signal<string | null>(null);
  salvandoNoBanco = signal<boolean>(false);
  
  // Mestre
  isMestre = computed(() => (this.usuarioAtual() || '').toUpperCase() === 'MESTRALYSSA');
  peritosMestre = signal<any[]>([]);

  ngOnInit() {
    this.carregarUsuariosCadastrados();
    const user = this.usuarioAtual();
    const peritoId = this.peritoIdAtual();

    if (!user) {
      this.mostrarTelaLogin.set(true);
    } else {
      this.carregarPeritosDoUsuario(user);
      if (peritoId) {
        this.carregarPeritoPorId(peritoId);
      }
    }
  }

  async carregarUsuariosCadastrados() {
    try {
      const res = await fetch('http://localhost:3000/api/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        this.usuariosCadastrados.set(data.users.map((u: any) => ({ id: u._id, username: u.username })));
      }
    } catch (e) {
      console.warn('Servidor backend inacessível:', e);
    }
  }

  async entrarComUsuario(nomeOpcional?: string) {
    const username = (nomeOpcional || this.inputUsuario()).trim();
    if (!username) {
      alert('Por favor, informe seu nome de usuário.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        const uName = data.user.username;
        this.usuarioAtual.set(uName);
        localStorage.setItem('limiar_usuario_ativo', uName);
        this.inputUsuario.set('');
        this.mostrarTelaLogin.set(false);

        await this.carregarPeritosDoUsuario(uName);
        this.mostrarTelaPeritos.set(true);
      } else {
        alert(data.error || 'Erro ao realizar login.');
      }
    } catch (e) {
      alert('Erro de conexão com o servidor. Certifique-se de que o backend (node server.js) está rodando.');
    }
  }

  async carregarPeritosDoUsuario(username: string) {
    try {
      if (username.toUpperCase() === 'MESTRALYSSA') {
        const resAll = await fetch('http://localhost:3000/api/peritos/all');
        const dataAll = await resAll.json();
        if (dataAll.success) {
          this.peritosMestre.set(dataAll.peritos);
        }
      }

      const res = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(username)}/peritos`);
      const data = await res.json();
      if (data.success) {
        this.peritosDoUsuario.set(data.peritos);
      }
    } catch (e) {
      console.warn('Erro ao carregar peritos:', e);
    }
  }

  abrirTelaLogin() {
    this.carregarUsuariosCadastrados();
    this.mostrarTelaLogin.set(true);
    this.mostrarTelaPeritos.set(false);
  }

  abrirTelaSelecaoPeritos() {
    const user = this.usuarioAtual();
    if (!user) {
      this.abrirTelaLogin();
      return;
    }
    this.carregarPeritosDoUsuario(user);
    this.mostrarTelaPeritos.set(true);
  }

  iniciarNovoPerito() {
    this.peritoIdAtual.set(null);
    localStorage.removeItem('limiar_perito_ativo');
    this.resetarFichaParaNovoPerito();
    this.mostrarTelaPeritos.set(false);
    this.mostrarTelaLogin.set(false);
  }

  async selecionarPerito(perito: any) {
    this.peritoIdAtual.set(perito._id);
    localStorage.setItem('limiar_perito_ativo', perito._id);
    this.aplicarDadosFicha(perito.fichaData);
    this.mostrarTelaPeritos.set(false);
    this.mostrarTelaLogin.set(false);

    const hora = new Date(perito.updatedAt).toLocaleTimeString();
    this.mensagemStatusBanco.set(`📖 Perito '${perito.nomePerito}' carregado com sucesso! (${hora})`);
    setTimeout(() => this.mensagemStatusBanco.set(null), 5000);
  }

  async deletarPerito(peritoId: string, event: Event) {
    event.stopPropagation();
    if (!confirm('Deseja realmente excluir este perito? Esta ação não pode ser desfeita.')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/peritos/${peritoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (this.peritoIdAtual() === peritoId) {
          this.iniciarNovoPerito();
        }
        const user = this.usuarioAtual();
        if (user) this.carregarPeritosDoUsuario(user);
      }
    } catch (e) {
      alert('Erro ao excluir perito.');
    }
  }

  resetarFichaParaNovoPerito() {
    this.nome.set('');
    this.historia.set('');
    this.aparencia.set('');
    this.profissaoNome.set(this.profissoes[0].nome);
    this.atributos.set({ vigor: 0, acuidade: 0, psicometria: 0, esoterismo: 0, razao: 0 });
    this.subAtributoDominante.set('inteligencia');
    this.vidaAtual.set(10);
    this.folegoAtual.set(10);
    this.sanidadeAtual.set(10);
    this.conhecimento.set(0);
    this.nivel.set(1);
    this.statusAtivos.set(new Set());
    this.inventario.set([]);
    this.rituaisMagias.set([]);
    this.dinheiroRolado.set(null);
    this.tracosRevelacao.set(0);
    this.comprasPorTrilha.set({});
  }

  aplicarDadosFicha(dados: any) {
    if (!dados) return;
    this.nome.set(dados.nome ?? '');
    this.historia.set(dados.historia ?? '');
    this.aparencia.set(dados.aparencia ?? '');
    this.profissaoNome.set(dados.profissao ?? this.profissoes[0].nome);
    this.atributos.set(dados.atributos ?? { vigor: 0, acuidade: 0, psicometria: 0, esoterismo: 0, razao: 0 });
    this.subAtributoDominante.set(dados.subAtributoDominante ?? 'inteligencia');
    this.vidaAtual.set(dados.vidaAtual ?? 0);
    this.folegoAtual.set(dados.folegoAtual ?? 0);
    this.sanidadeAtual.set(dados.sanidadeAtual ?? 0);
    this.conhecimento.set(dados.conhecimento ?? 0);
    this.nivel.set(dados.nivel ?? 1);
    this.statusAtivos.set(new Set(dados.statusAtivos ?? []));
    this.inventario.set(dados.inventario ?? []);
    this.rituaisMagias.set(dados.rituaisMagias ?? []);
    this.dinheiroRolado.set(dados.dinheiroRolado ?? null);
    this.tracosRevelacao.set(dados.tracosRevelacao ?? 0);
    this.comprasPorTrilha.set(dados.comprasPorTrilha ?? {});
  }

  async carregarPeritoPorId(peritoId: string) {
    try {
      const res = await fetch(`http://localhost:3000/api/peritos/${peritoId}`);
      const data = await res.json();
      if (data.success && data.perito) {
        this.aplicarDadosFicha(data.perito.fichaData);
      }
    } catch (e) {
      console.warn('Erro ao buscar perito por id:', e);
    }
  }

  async salvarFichaNoBanco() {
    const user = this.usuarioAtual();
    if (!user) {
      this.abrirTelaLogin();
      return;
    }

    const nomePerito = (this.nome() || '').trim();
    if (!nomePerito) {
      alert('Por favor, informe o NOME DO PERITO na aba "Identidade" antes de salvar a ficha.');
      this.selecionarAba('identidade');
      return;
    }

    this.salvandoNoBanco.set(true);
    const ficha = {
      nome: this.nome(),
      historia: this.historia(),
      aparencia: this.aparencia(),
      profissao: this.profissaoNome(),
      atributos: this.atributos(),
      subAtributoDominante: this.subAtributoDominante(),
      vidaAtual: this.vidaAtual(),
      folegoAtual: this.folegoAtual(),
      sanidadeAtual: this.sanidadeAtual(),
      conhecimento: this.conhecimento(),
      nivel: this.nivel(),
      statusAtivos: Array.from(this.statusAtivos()),
      inventario: this.inventario(),
      rituaisMagias: this.rituaisMagias(),
      dinheiroRolado: this.dinheiroRolado(),
      tracosRevelacao: this.tracosRevelacao(),
      comprasPorTrilha: this.comprasPorTrilha()
    };

    try {
      const res = await fetch('http://localhost:3000/api/peritos/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peritoId: this.peritoIdAtual(),
          username: user,
          ficha
        })
      });
      const data = await res.json();
      this.salvandoNoBanco.set(false);
      if (data.success) {
        if (data.peritoId) {
          this.peritoIdAtual.set(data.peritoId);
          localStorage.setItem('limiar_perito_ativo', data.peritoId);
        }
        this.carregarPeritosDoUsuario(user);
        const hora = new Date().toLocaleTimeString();
        this.mensagemStatusBanco.set(`✅ Ficha de '${nomePerito}' salva com sucesso às ${hora}!`);
        setTimeout(() => this.mensagemStatusBanco.set(null), 5000);
      } else {
        alert('Erro ao salvar ficha: ' + data.error);
      }
    } catch (e) {
      this.salvandoNoBanco.set(false);
      alert('Não foi possível conectar ao servidor.');
    }
  }

  async carregarFichaDoBanco(user: string) {
    try {
      const res = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(user)}/ficha`);
      const data = await res.json();
      if (data.success && data.exists && data.ficha) {
        const dados = data.ficha;
        this.nome.set(dados.nome ?? '');
        this.historia.set(dados.historia ?? '');
        this.aparencia.set(dados.aparencia ?? '');
        this.profissaoNome.set(dados.profissao ?? this.profissoes[0].nome);
        this.atributos.set(dados.atributos ?? { vigor: 0, acuidade: 0, psicometria: 0, esoterismo: 0, razao: 0 });
        this.subAtributoDominante.set(dados.subAtributoDominante ?? 'inteligencia');
        this.vidaAtual.set(dados.vidaAtual ?? 0);
        this.folegoAtual.set(dados.folegoAtual ?? 0);
        this.sanidadeAtual.set(dados.sanidadeAtual ?? 0);
        this.conhecimento.set(dados.conhecimento ?? 0);
        this.nivel.set(dados.nivel ?? 1);
        this.statusAtivos.set(new Set(dados.statusAtivos ?? []));
        this.inventario.set(dados.inventario ?? []);
        this.rituaisMagias.set(dados.rituaisMagias ?? []);
        this.dinheiroRolado.set(dados.dinheiroRolado ?? null);
        this.tracosRevelacao.set(dados.tracosRevelacao ?? 0);
        this.comprasPorTrilha.set(dados.comprasPorTrilha ?? {});

        const hora = new Date(data.savedAt).toLocaleTimeString();
        this.mensagemStatusBanco.set(`📖 Ficha de '${user}' carregada com sucesso! (${hora})`);
        setTimeout(() => this.mensagemStatusBanco.set(null), 5000);
      } else {
        // Novo perito sem ficha salva ainda
        this.resetarFichaParaNovoPerito();
      }
    } catch (e) {
      console.warn('Erro ao carregar ficha:', e);
    }
  }

  // --- Abas de navegação ---
  abaAtiva = signal<AbaId>('identidade');

  abas: { id: AbaId; label: string }[] = [
    { id: 'identidade', label: 'Identidade' },
    { id: 'atributos', label: 'Atributos' },
    { id: 'combate', label: 'Status & Combate' },
    { id: 'inventario', label: 'Inventário' },
    { id: 'magias', label: 'Grimório' },
    { id: 'caminhos', label: 'Caminhos' },
    { id: 'tabelas', label: 'Tabelas' }
  ];

  // --- Wiki do Sistema ---
  wikiTopics = WIKI_DATA;
  wikiSelecionado = signal<WikiTopic>(this.wikiTopics[0]);
  wikiCategoriaExpandida = signal<boolean>(true);

  toggleWikiCategoria() {
    this.wikiCategoriaExpandida.set(!this.wikiCategoriaExpandida());
  }

  selecionarAba(aba: AbaId) {
    this.abaAtiva.set(aba);
  }

  getTabIconSvg(id: AbaId): SafeHtml {
    const icons: Record<AbaId, string> = {
      identidade: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      atributos: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      combate: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`,
      inventario: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      magias: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/></svg>`,
      caminhos: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
      tabelas: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[id] ?? '');
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // --- Identidade ---
  nome = signal('');
  historia = signal('');
  aparencia = signal('');
  profissaoNome = signal(this.profissoes[0].nome);

  // --- Estado do Modal de Profissão ---
  isProfissaoModalOpen = signal(false);
  profissaoPreview = signal<Profissao>(this.profissoes[0]);

  abrirProfissaoModal() {
    this.profissaoPreview.set(this.profissaoAtual());
    this.isProfissaoModalOpen.set(true);
  }

  fecharProfissaoModal() {
    this.isProfissaoModalOpen.set(false);
  }

  confirmarProfissao() {
    this.profissaoNome.set(this.profissaoPreview().nome);
    this.fecharProfissaoModal();
  }

  profissaoAtual = computed<Profissao>(() =>
    this.profissoes.find(p => p.nome === this.profissaoNome()) ?? this.profissoes[0]
  );

  possuiEquipamentoInicial = computed<boolean>(() => {
    const eq = this.profissaoAtual().equipamento.toLowerCase();
    return eq !== '' && eq !== '-' && eq !== '—' && eq !== 'nenhum' && !eq.includes('nada');
  });

  // --- Atributos base (distribuídos na criação) ---
  atributos = signal<Atributos>({
    vigor: 0,
    acuidade: 0,
    psicometria: 0,
    esoterismo: 0,
    razao: 0
  });

  // Sub-atributo dominante de PSICOMETRIA
  subAtributoDominante = signal<'inteligencia' | 'sapiencia'>('inteligencia');

  pontosGastos = computed(() => {
    const a = this.atributos();
    return a.vigor + a.acuidade + a.psicometria + a.esoterismo + a.razao;
  });

  pontosTotaisAtributos = computed(() => PONTOS_INICIAIS + Math.max(0, this.nivel() - 1));

  pontosRestantes = computed(() => this.pontosTotaisAtributos() - this.pontosGastos());

  ajustarAtributo(chave: AtributoChave, delta: number) {
    const atual = { ...this.atributos() };
    const novoValor = atual[chave] + delta;
    if (novoValor < MIN_ATRIBUTO || novoValor > MAX_ATRIBUTO) return;
    if (delta > 0 && this.pontosRestantes() <= 0) return;
    atual[chave] = novoValor;
    this.atributos.set(atual);
  }

  setAtributo(chave: AtributoChave, val: number | string) {
    const parsed = parseInt(String(val), 10);
    const clamped = Math.max(MIN_ATRIBUTO, Math.min(MAX_ATRIBUTO, isNaN(parsed) ? MIN_ATRIBUTO : parsed));
    const atual = { ...this.atributos() };
    atual[chave] = clamped;
    this.atributos.set(atual);
  }

  // --- Derivados mecânicos (conforme o livro) ---
  bonusProfissao = computed(() => this.parseBonusProfissao(this.profissaoAtual().bonus));

  vigorTotal = computed(() => this.atributos().vigor + (this.bonusProfissao().vigor ?? 0));
  acuidadeTotal = computed(() => this.atributos().acuidade + (this.bonusProfissao().acuidade ?? 0));
  psicometriaTotal = computed(() => this.atributos().psicometria + (this.bonusProfissao().psicometria ?? 0));
  esoterismoTotal = computed(() => this.atributos().esoterismo + (this.bonusProfissao().esoterismo ?? 0));
  razaoTotal = computed(() => this.atributos().razao + (this.bonusProfissao().razao ?? 0));

  inteligencia = computed(() =>
    this.subAtributoDominante() === 'inteligencia'
      ? this.psicometriaTotal()
      : this.psicometriaTotal() - 3
  );
  sapiencia = computed(() =>
    this.subAtributoDominante() === 'sapiencia'
      ? this.psicometriaTotal()
      : this.psicometriaTotal() - 3
  );

  vidaMaximaBase = computed(() => this.vigorTotal() + 10);
  vidaMaximaOverride = signal<number | null>(null);
  vidaMaxima = computed(() => this.vidaMaximaOverride() ?? this.vidaMaximaBase());

  folegoMaximoBase = computed(() => this.vigorTotal());
  folegoMaximoOverride = signal<number | null>(null);
  folegoMaximo = computed(() => this.folegoMaximoOverride() ?? this.folegoMaximoBase());

  // Sanidade = RAZÃO (mín. 2) + 1d6. Rolagem manual pelo jogador.
  ultimaRolagemSanidade = signal<number | null>(null);
  sanidadeTotalBase = computed(() => {
    return Math.max(this.razaoTotal(), 2) + (this.ultimaRolagemSanidade() ?? 0);
  });
  sanidadeMaximaOverride = signal<number | null>(null);
  sanidadeTotal = computed(() => this.sanidadeMaximaOverride() ?? this.sanidadeTotalBase());

  rolarSanidade() {
    this.ultimaRolagemSanidade.set(rollDie(6));
  }

  setVidaMaxima(val: number | string) {
    const parsed = parseInt(String(val), 10);
    this.vidaMaximaOverride.set(isNaN(parsed) ? 0 : Math.max(0, parsed));
  }

  setFolegoMaximo(val: number | string) {
    const parsed = parseInt(String(val), 10);
    this.folegoMaximoOverride.set(isNaN(parsed) ? 0 : Math.max(0, parsed));
  }

  setSanidadeMaxima(val: number | string) {
    const parsed = parseInt(String(val), 10);
    this.sanidadeMaximaOverride.set(isNaN(parsed) ? 0 : Math.max(0, parsed));
  }

  // --- Dinheiro / equipamento inicial ---
  dinheiroRolado = signal<number | null>(null);
  dinheiroInput = signal<string>('');

  rolarDinheiro() {
    this.dinheiroRolado.set(rollFormula(this.profissaoAtual().dinheiro));
  }

  adicionarDinheiro() {
    const raw = (this.dinheiroInput() || '').toString().trim().replace(',', '.');
    const val = parseFloat(raw);
    if (!isNaN(val)) {
      const atual = this.dinheiroRolado() ?? 0;
      const novoTotal = Math.max(0, Math.round((atual + val) * 100) / 100);
      this.dinheiroRolado.set(novoTotal);
      this.dinheiroInput.set('');
    }
  }

  adicionarEquipamentoProfissao() {
    const equip = this.profissaoAtual().equipamento;
    if (!equip || equip === '—' || equip === 'Nenhum' || equip === 'Não começa com nada' || equip === 'Não começa com nada extra') {
      return;
    }
    const itens = equip.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.inventario.update(lista => {
      const nova = [...lista];
      for (const item of itens) {
        if (!nova.includes(item)) {
          nova.push(item);
        }
      }
      return nova;
    });
  }

  // --- Status / recursos de jogo ---
  vidaAtual = signal(0);
  folegoAtual = signal(0);
  sanidadeAtual = signal(0);
  conhecimento = signal(0); // 0-100%
  nivel = signal(1);

  ajustarNivel(delta: number) {
    this.nivel.update(n => Math.max(1, (Number(n) || 1) + delta));
  }

  setNivel(val: number | string) {
    const parsed = parseInt(String(val), 10);
    this.nivel.set(isNaN(parsed) || parsed < 1 ? 1 : parsed);
  }

  adicionarConhecimento(qtd: number) {
    let total = Math.max(0, (this.conhecimento() || 0) + qtd);
    if (total >= 100) {
      const levelUps = Math.floor(total / 100);
      total = total % 100;
      this.nivel.update(n => n + levelUps);
      this.tracosRevelacao.update(t => t + levelUps);
    }
    this.conhecimento.set(total);
  }

  ajustarConhecimento(delta: number) {
    this.adicionarConhecimento(delta);
  }

  setConhecimento(val: number | string) {
    const parsed = parseInt(String(val), 10);
    if (isNaN(parsed)) return;
    const diff = parsed - this.conhecimento();
    this.adicionarConhecimento(diff);
  }

  sincronizarComMaximos() {
    this.vidaAtual.set(this.vidaMaxima());
    this.folegoAtual.set(this.folegoMaximo());
    this.sanidadeAtual.set(this.sanidadeTotal());
  }

  ajustarRecurso(rec: 'vida' | 'folego' | 'sanidade', delta: number) {
    if (rec === 'vida') this.vidaAtual.update(v => v + delta);
    if (rec === 'folego') {
      this.folegoAtual.update(v => {
        const newValue = Math.max(0, v + delta);
        if (newValue === 0) {
          const set = new Set(this.statusAtivos());
          set.add('Exaustão');
          this.statusAtivos.set(set);
        }
        return newValue;
      });
    }
    if (rec === 'sanidade') {
      if (delta < 0) {
        this.adicionarConhecimento(Math.abs(delta));
      }
      this.sanidadeAtual.update(v => v + delta);
    }
  }

  setRecurso(rec: 'vida' | 'folego' | 'sanidade', val: number | string) {
    const parsed = parseInt(String(val), 10);
    const valor = isNaN(parsed) ? 0 : parsed;
    if (rec === 'vida') this.vidaAtual.set(valor);
    if (rec === 'folego') {
      const newValue = Math.max(0, valor);
      this.folegoAtual.set(newValue);
      if (newValue === 0) {
        const set = new Set(this.statusAtivos());
        set.add('Exaustão');
        this.statusAtivos.set(set);
      }
    }
    if (rec === 'sanidade') this.sanidadeAtual.set(valor);
  }

  // Porcentagens para barras de progresso HUD
  vidaPorcentagem = computed(() => {
    const max = Math.max(1, this.vidaMaxima());
    return Math.max(0, Math.min(100, Math.round((this.vidaAtual() / max) * 100)));
  });

  folegoPorcentagem = computed(() => {
    const max = Math.max(1, this.folegoMaximo());
    return Math.max(0, Math.min(100, Math.round((this.folegoAtual() / max) * 100)));
  });

  sanidadePorcentagem = computed(() => {
    const max = Math.max(1, this.sanidadeTotal());
    return Math.max(0, Math.min(100, Math.round((this.sanidadeAtual() / max) * 100)));
  });

  // Sistema de barras extras "estilo Budokai Tenkaichi 3": cada vez que o excedente
  // preenche uma barra inteira (múltiplo do máximo), uma nova camada nasce 10% mais
  // tingida de magenta que a anterior, e essa nova camada é empilhada por cima.
  private extraSegmentos(corBase: string, atual: number, max: number): { percent: number; background: string; zIndex: number }[] {
    const maximo = Math.max(1, max);
    const excedente = Math.max(0, atual - maximo);
    if (excedente <= 0) return [];

    const lapsCompletos = Math.floor((excedente - 1) / maximo) + 1;
    const segmentos: { percent: number; background: string; zIndex: number }[] = [];

    for (let lap = 1; lap <= lapsCompletos; lap++) {
      const restanteNestaVolta = excedente - (lap - 1) * maximo;
      const percent = Math.max(0, Math.min(100, (restanteNestaVolta / maximo) * 100));
      const tint = Math.min(100, lap * 10);
      segmentos.push({
        percent,
        background: this.extraTintBackground(corBase, tint),
        zIndex: 10 + lap
      });
    }
    return segmentos;
  }

  private extraTintBackground(corBase: string, tint: number): string {
    return `color-mix(in srgb, ${corBase} ${100 - tint}%, #ff00e6 ${tint}%)`;
  }

  vidaExtraSegmentos = computed(() => this.extraSegmentos('var(--color-vigor)', this.vidaAtual(), this.vidaMaxima()));
  folegoExtraSegmentos = computed(() => this.extraSegmentos('var(--color-acuidade)', this.folegoAtual(), this.folegoMaximo()));
  sanidadeExtraSegmentos = computed(() => this.extraSegmentos('var(--color-razao)', this.sanidadeAtual(), this.sanidadeTotal()));

  conhecimentoPorcentagem = computed(() => {
    return Math.max(0, Math.min(100, this.conhecimento()));
  });

  tabelaEstadosMentais = [
    { min: -10, max: -1, faixa: '-1 a -10', efeito: 'Casos de Paranoia Severa e Alucinações', cor: '#d8b4fe' },
    { min: -20, max: -11, faixa: '-11 a -20', efeito: 'Casos de Psicose Grave e Agressividade', cor: '#c084fc' },
    { min: -30, max: -21, faixa: '-21 a -30', efeito: 'Perda de Memória, Dificuldade Motora (-1 de ACUIDADE)', cor: '#a855f7' },
    { min: -40, max: -31, faixa: '-31 a -40', efeito: 'Toques Fantasmas, Episódios de Devaneios e Incapacidade de Fala', cor: '#9333ea' },
    { min: -50, max: -41, faixa: '-41 a -50', efeito: 'Dano Cerebral Permanente (-5 em todos os testes)', cor: '#7e22ce' },
    { min: -60, max: -51, faixa: '-51 a -60', efeito: 'Dano Cerebral Grave Permanente (-8 em todos os testes)', cor: '#6b21a8' },
    { min: -70, max: -61, faixa: '-61 a -70', efeito: 'Irrecuperável', cor: '#4c1d95' },
    { min: -100, max: -71, faixa: '-71 a -100', efeito: 'Morte Cerebral', cor: '#2e1065' }
  ];

  estagioMentalAtual = computed(() => {
    const s = this.sanidadeAtual();
    if (s >= 0) return null;
    return this.tabelaEstadosMentais.find(item => s >= item.min && s <= item.max) ?? this.tabelaEstadosMentais[7];
  });

  sanidadeNegativaPorcentagem = computed(() => {
    const s = this.sanidadeAtual();
    if (s >= 0) return 0;
    return Math.min(100, Math.abs(s));
  });

  statusList = [
    { nome: 'Exaustão', desc: '-[VIGOR] em todos os testes; requer 1h+ de descanso' },
    { nome: 'Insano', desc: 'Toma 2x de dano em sanidade' },
    { nome: 'Ansioso', desc: 'Indicador de ansiedade e fobias' },
    { nome: 'Estressado', desc: 'Indicador de esquizofrenia e paranoia' },
    { nome: 'Deprimido', desc: 'Indicador de depressão leve / desânimo social' },
    { nome: 'Suicida', desc: 'Indicador de depressão moderada ou grave' },
    { nome: 'Câncer', desc: '-2 do atributo VIGOR (consumo de cigarros)' },
    { nome: 'Embriagado', desc: '-2 no teste de ACUIDADE' }
  ];

  statusAtivos = signal<Set<string>>(new Set());

  toggleStatus(s: string) {
    const set = new Set(this.statusAtivos());
    if (set.has(s)) set.delete(s); else set.add(s);
    this.statusAtivos.set(set);
  }

  // --- Rolagem rápida de teste d20 + atributo (Livro pág. 4) ---
  ultimoResultadoTeste = signal<{
    atributo: string;
    d20: number;
    mod: number;
    total: number;
    critico: boolean;
    falhaCritica: boolean;
  } | null>(null);

  rolarTesteAtributo(nome: string, modificador: number) {
    const d20 = rollDie(20);
    const critico = d20 === 20;
    const falhaCritica = d20 === 1;
    const total = d20 + modificador;
    this.ultimoResultadoTeste.set({
      atributo: nome,
      d20,
      mod: modificador,
      total,
      critico,
      falhaCritica
    });
  }

  limparResultadoTeste() {
    this.ultimoResultadoTeste.set(null);
  }

  // --- Inventário livre ---
  inventario = signal<string[]>([]);
  novoItem = '';
  adicionarItem() {
    const v = this.novoItem.trim();
    if (!v) return;
    this.inventario.update(list => [...list, v]);
    this.novoItem = '';
  }
  removerItem(i: number) {
    this.inventario.update(list => list.filter((_, idx) => idx !== i));
  }

  // --- Rituais / Magias conhecidas (anotações livres) ---
  rituaisMagias = signal<string[]>([]);
  novoRitual = '';
  adicionarRitual() {
    const v = this.novoRitual.trim();
    if (!v) return;
    this.rituaisMagias.update(list => [...list, v]);
    this.novoRitual = '';
  }
  removerRitual(i: number) {
    this.rituaisMagias.update(list => list.filter((_, idx) => idx !== i));
  }

  // parse bônus textual das profissões, extraindo só os valores numéricos por atributo principal
  private parseBonusProfissao(texto: string): Partial<Atributos> {
    const resultado: Partial<Atributos> = {};
    if (!texto || texto === '—') return resultado;
    const regexes: [RegExp, AtributoChave][] = [
      [/([+-]\d+)\s*em\s*VIGOR/i, 'vigor'],
      [/([+-]\d+)\s*VIGOR/i, 'vigor'],
      [/([+-]\d+)\s*em\s*ACUIDADE/i, 'acuidade'],
      [/([+-]\d+)\s*ACUIDADE/i, 'acuidade'],
      [/([+-]\d+)\s*em\s*PSICOMETRIA/i, 'psicometria'],
      [/([+-]\d+)\s*PSICOMETRIA/i, 'psicometria'],
      [/([+-]\d+)\s*em\s*ESOTERISMO/i, 'esoterismo'],
      [/([+-]\d+)\s*ESOTERISMO/i, 'esoterismo'],
      [/([+-]\d+)\s*em\s*RAZÃO/i, 'razao'],
      [/([+-]\d+)\s*RAZÃO/i, 'razao']
    ];
    for (const [regex, chave] of regexes) {
      const m = texto.match(regex);
      if (m && resultado[chave] === undefined) {
        resultado[chave] = parseInt(m[1], 10);
      }
    }
    return resultado;
  }

  // --- Exportar ficha em PDF formatado ---
  async exportarFicha() {
    const nome = this.nome() || 'Perito Sem Nome';
    const prof = this.profissaoAtual();
    const attrs = {
      vigor: this.vigorTotal(),
      acuidade: this.acuidadeTotal(),
      psicometria: this.psicometriaTotal(),
      esoterismo: this.esoterismoTotal(),
      razao: this.razaoTotal()
    };
    const inv = this.inventario();
    const rituais = this.rituaisMagias();
    const status = Array.from(this.statusAtivos());
    const historia = this.historia() || 'Nenhuma história registrada.';
    const aparencia = this.aparencia() || 'Nenhuma descrição visual registrada.';

    const htmlContent = `
      <div id="pdf-content">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;700&family=Silkscreen:wght@400;700&family=Sixtyfour&display=swap');
          
          #pdf-content {
            background-color: #060608 !important;
            color: #f3f5fa;
            font-family: 'Silkscreen', monospace;
            padding: 15mm;
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
            line-height: 1.4;
          }

          #pdf-content * {
            box-sizing: border-box;
          }

          .pdf-header {
            border-bottom: 2px solid #4f567a;
            padding-bottom: 10px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .pdf-title {
            font-family: 'Sixtyfour', sans-serif;
            font-size: 16pt;
            color: #f3f5fa;
            margin: 0;
            text-transform: uppercase;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
          }

          .pdf-subtitle {
            font-family: 'Silkscreen', monospace;
            font-size: 8pt;
            font-weight: 700;
            color: #959cb3;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 6px;
          }

          .pdf-badge {
            font-family: 'Silkscreen', monospace;
            background: #333850 !important;
            color: #f3f5fa;
            font-size: 8pt;
            padding: 4px 10px;
            border-radius: 2px;
          }

          .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }

          .card {
            border: 1px solid #333850;
            border-radius: 4px;
            padding: 12px;
            background: #11131c !important;
          }

          .card-title {
            font-family: 'Silkscreen', monospace;
            font-size: 9pt;
            color: #f3f5fa;
            border-bottom: 1px dashed #333850;
            padding-bottom: 4px;
            margin-bottom: 10px;
          }

          .field-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 8pt;
          }
          .field-label { font-weight: 600; color: #959cb3; }
          .field-val { font-weight: 700; color: #f3f5fa; }

          .vitals-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            text-align: center;
            margin-bottom: 16px;
          }

          .vital-box {
            border: 1px solid #333850;
            border-radius: 4px;
            padding: 8px;
            background: #11131c !important;
          }

          .vital-val {
            font-family: 'Silkscreen', monospace;
            font-size: 14pt;
            font-weight: 700;
            color: #f3f5fa;
          }

          .vital-name {
            font-family: 'Silkscreen', monospace;
            font-size: 7pt;
            color: #959cb3;
            margin-top: 4px;
          }

          .attr-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
          }
          .attr-table th, .attr-table td {
            border: 1px solid #333850;
            padding: 6px 8px;
            text-align: center;
            font-size: 8pt;
          }
          .attr-table th { 
            background: #060608 !important; 
            font-family: 'Silkscreen', monospace;
            font-size: 7pt;
            color: #959cb3; 
          }
          .attr-table td strong {
            font-family: 'Silkscreen', monospace;
            font-size: 10pt;
            color: #f3f5fa;
          }

          .list-container {
            margin: 0;
            padding-left: 18px;
            font-size: 8pt;
            color: #f3f5fa;
          }
          .list-container li { margin-bottom: 4px; }
          .text-block {
            font-size: 8pt;
            color: #959cb3;
            white-space: pre-wrap;
            margin: 0;
          }
          .status-tag {
            display: inline-block;
            background: rgba(239, 68, 68, 0.2) !important;
            border: 1px solid #ef4444;
            color: #fca5a5;
            font-size: 8pt;
            font-family: 'Silkscreen', monospace;
            padding: 2px 6px;
            border-radius: 2px;
            margin-right: 4px;
            margin-bottom: 4px;
          }
        </style>
        
        <div class="pdf-header">
          <div>
            <div class="pdf-subtitle">LIMIAR 1ª EDIÇÃO &bull; FICHA DE PERITO</div>
            <h1 class="pdf-title">${nome}</h1>
          </div>
          <div style="text-align: right;">
            <span class="pdf-badge">NÍVEL ${this.nivel()}</span>
            <div style="font-family: 'Silkscreen', monospace; font-size: 8pt; color: #959cb3; margin-top: 6px;">
              Perito: ${this.usuarioAtual() || 'Desconhecido'}
            </div>
          </div>
        </div>

        <div class="vitals-grid">
          <div class="vital-box" style="border-top: 3px solid #ff3848;">
            <div class="vital-val">${this.vidaAtual()} / ${this.vidaMaxima()}</div>
            <div class="vital-name">Vida (PV)</div>
          </div>
          <div class="vital-box" style="border-top: 3px solid #38bdf8;">
            <div class="vital-val">${this.folegoAtual()} / ${this.folegoMaximo()}</div>
            <div class="vital-name">Fôlego (PF)</div>
          </div>
          <div class="vital-box" style="border-top: 3px solid #a855f7;">
            <div class="vital-val">${this.sanidadeAtual()} / ${this.sanidadeTotal()}</div>
            <div class="vital-name">Sanidade (PS)</div>
          </div>
          <div class="vital-box" style="border-top: 3px solid #00e5a3;">
            <div class="vital-val">${this.conhecimento()}%</div>
            <div class="vital-name">Conhecimento</div>
          </div>
        </div>

        <div class="section-grid">
          <div class="card">
            <div class="card-title">01. Identidade & Profissão</div>
            <div class="field-row"><span class="field-label">Profissão:</span> <span class="field-val">${prof.nome}</span></div>
            <div class="field-row"><span class="field-label">Bônus Mecânico:</span> <span class="field-val">${prof.bonus}</span></div>
            <div class="field-row"><span class="field-label">Dominância Mental:</span> <span class="field-val" style="font-family: 'Silkscreen', monospace; text-transform: uppercase;">${this.subAtributoDominante()}</span></div>
            <div class="field-row"><span class="field-label">Traços de Revelação:</span> <span class="field-val">${this.tracosRevelacao()}</span></div>
            <div style="margin-top: 8px; border-top: 1px solid #333850; padding-top: 8px;">
              <span class="field-label" style="display:block; margin-bottom:4px;">Status Ativos:</span>
              <div>
                ${status.length > 0 ? status.map(s => `<span class="status-tag">${s}</span>`).join('') : '<em style="font-size: 8pt; color: #959cb3;">Nenhum status negativo</em>'}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">02. Atributos da Ficha</div>
            <table class="attr-table">
              <thead>
                <tr>
                  <th>ATRIBUTO</th>
                  <th>BASE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="color: #ff3848;">Vigor</td><td>${this.atributos().vigor}</td><td><strong>${attrs.vigor}</strong></td></tr>
                <tr><td style="color: #00e5a3;">Acuidade</td><td>${this.atributos().acuidade}</td><td><strong>${attrs.acuidade}</strong></td></tr>
                <tr><td style="color: #38bdf8;">Psicometria</td><td>${this.atributos().psicometria}</td><td><strong>${attrs.psicometria}</strong></td></tr>
                <tr><td style="color: #e040fb;">Esoterismo</td><td>${this.atributos().esoterismo}</td><td><strong>${attrs.esoterismo}</strong></td></tr>
                <tr><td style="color: #fbbf24;">Razão</td><td>${this.atributos().razao}</td><td><strong>${attrs.razao}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="section-grid">
          <div class="card">
            <div class="card-title">03. Inventário & Equipamentos</div>
            ${inv.length > 0 ? `<ul class="list-container">${inv.map(item => `<li>${item}</li>`).join('')}</ul>` : '<p class="text-block" style="font-style: italic;">Inventário vazio.</p>'}
          </div>

          <div class="card">
            <div class="card-title">04. Grimório / Rituais / Habilidades</div>
            ${rituais.length > 0 ? `<ul class="list-container">${rituais.map(r => `<li>${r}</li>`).join('')}</ul>` : '<p class="text-block" style="font-style: italic;">Nenhum ritual ou magia anotada.</p>'}
          </div>
        </div>

        <div class="card" style="margin-bottom: 16px;">
          <div class="card-title">05. História & Primeiro Contato</div>
          <p class="text-block">${historia}</p>
        </div>

        <div class="card">
          <div class="card-title">06. Aparência & Peculiaridades</div>
          <p class="text-block">${aparencia}</p>
        </div>
      </div>
    `;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      // Anexa temporariamente ao DOM para garantir que fontes carreguem?
      // element.style.position = 'absolute';
      // element.style.left = '-9999px';
      // document.body.appendChild(element);
      
      const opt: any = {
        margin:       0,
        filename:     `Ficha_Perito_${nome.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      // Pequeno atraso para fontes, caso necessário, mas html2canvas tem um delay interno
      setTimeout(() => {
        html2pdf().set(opt).from(element).save();
      }, 500);

    } catch (err) {
      console.error("Erro ao carregar html2pdf", err);
      alert("Não foi possível gerar o PDF direto. Verifique o console.");
    }
  }

  importarFicha(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dados = JSON.parse(reader.result as string);
        this.nome.set(dados.nome ?? '');
        this.historia.set(dados.historia ?? '');
        this.aparencia.set(dados.aparencia ?? '');
        this.profissaoNome.set(dados.profissao ?? this.profissoes[0].nome);
        this.atributos.set(dados.atributos ?? { vigor: 0, acuidade: 0, psicometria: 0, esoterismo: 0, razao: 0 });
        this.subAtributoDominante.set(dados.subAtributoDominante ?? 'inteligencia');
        this.vidaAtual.set(dados.vidaAtual ?? 0);
        this.folegoAtual.set(dados.folegoAtual ?? 0);
        this.sanidadeAtual.set(dados.sanidadeAtual ?? 0);
        this.conhecimento.set(dados.conhecimento ?? 0);
        this.nivel.set(dados.nivel ?? 1);
        this.statusAtivos.set(new Set(dados.statusAtivos ?? []));
        this.inventario.set(dados.inventario ?? []);
        this.rituaisMagias.set(dados.rituaisMagias ?? []);
        this.dinheiroRolado.set(dados.dinheiroRolado ?? null);
        this.tracosRevelacao.set(dados.tracosRevelacao ?? 0);
        this.comprasPorTrilha.set(dados.comprasPorTrilha ?? {});
      } catch (e) {
        alert('Arquivo de ficha inválido.');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  // --- Caminhos do Indizível (Traços de Revelação / Nós de Conhecimento) ---
  caminhos: Caminho[] = CAMINHOS;
  caminhoAtivo = signal<string>(this.caminhos[0].nome);
  trilhaAtivaIndex = signal<number>(0);
  tracosRevelacao = signal(0);

  caminhoAtual = computed(() =>
    this.caminhos.find(c => c.nome === this.caminhoAtivo()) ?? this.caminhos[0]
  );

  trilhaAtual = computed(() => {
    const c = this.caminhoAtual();
    return c.trilhas[this.trilhaAtivaIndex()] ?? c.trilhas[0];
  });

  selecionarCaminho(nome: string) {
    this.caminhoAtivo.set(nome);
    this.trilhaAtivaIndex.set(0);
  }

  selecionarTrilha(index: number) {
    this.trilhaAtivaIndex.set(index);
  }

  totalNosCompradosCaminho(caminhoNome: string): number {
    const c = this.caminhos.find(x => x.nome === caminhoNome);
    if (!c) return 0;
    return c.trilhas.reduce((acc, t) => acc + this.nosComprados(c.nome, t.nome), 0);
  }

  coresTrilhas: Record<string, { cor: string; corSub: string; glow: string; bg: string }[]> = {
    'Caminho Eidolon': [
      { cor: '#ff3848', corSub: '#ff1744', glow: 'rgba(255, 56, 72, 0.45)', bg: 'rgba(255, 56, 72, 0.08)' },
      { cor: '#ff6347', corSub: '#ff4500', glow: 'rgba(255, 99, 71, 0.45)', bg: 'rgba(255, 99, 71, 0.08)' },
      { cor: '#d90429', corSub: '#b7094c', glow: 'rgba(217, 4, 41, 0.45)', bg: 'rgba(217, 4, 41, 0.08)' },
      { cor: '#ff4d8d', corSub: '#f72585', glow: 'rgba(255, 77, 141, 0.45)', bg: 'rgba(255, 77, 141, 0.08)' }
    ],
    'Caminho Profético': [
      { cor: '#00e5a3', corSub: '#00b894', glow: 'rgba(0, 229, 163, 0.45)', bg: 'rgba(0, 229, 163, 0.08)' },
      { cor: '#00f5d4', corSub: '#00cec9', glow: 'rgba(0, 245, 212, 0.45)', bg: 'rgba(0, 245, 212, 0.08)' },
      { cor: '#10b981', corSub: '#059669', glow: 'rgba(16, 185, 129, 0.45)', bg: 'rgba(16, 185, 129, 0.08)' },
      { cor: '#06d6a0', corSub: '#20bf6b', glow: 'rgba(6, 214, 160, 0.45)', bg: 'rgba(6, 214, 160, 0.08)' }
    ],
    'Caminho Real': [
      { cor: '#38bdf8', corSub: '#0284c7', glow: 'rgba(56, 189, 248, 0.45)', bg: 'rgba(56, 189, 248, 0.08)' },
      { cor: '#00d2ff', corSub: '#0099ff', glow: 'rgba(0, 210, 255, 0.45)', bg: 'rgba(0, 210, 255, 0.08)' },
      { cor: '#60a5fa', corSub: '#3b82f6', glow: 'rgba(96, 165, 250, 0.45)', bg: 'rgba(96, 165, 250, 0.08)' },
      { cor: '#818cf8', corSub: '#6366f1', glow: 'rgba(129, 140, 248, 0.45)', bg: 'rgba(129, 140, 248, 0.08)' }
    ],
    'Caminho Ancião': [
      { cor: '#e040fb', corSub: '#d500f9', glow: 'rgba(224, 64, 251, 0.45)', bg: 'rgba(224, 64, 251, 0.08)' },
      { cor: '#c026d3', corSub: '#a21caf', glow: 'rgba(192, 38, 211, 0.45)', bg: 'rgba(192, 38, 211, 0.08)' },
      { cor: '#a855f7', corSub: '#9333ea', glow: 'rgba(168, 85, 247, 0.45)', bg: 'rgba(168, 85, 247, 0.08)' },
      { cor: '#f43f5e', corSub: '#e11d48', glow: 'rgba(244, 63, 94, 0.45)', bg: 'rgba(244, 63, 94, 0.08)' }
    ],
    'Caminho da Loucura': [
      { cor: '#fbbf24', corSub: '#f59e0b', glow: 'rgba(251, 191, 36, 0.45)', bg: 'rgba(251, 191, 36, 0.08)' },
      { cor: '#facc15', corSub: '#eab308', glow: 'rgba(250, 204, 21, 0.45)', bg: 'rgba(250, 204, 21, 0.08)' },
      { cor: '#f97316', corSub: '#ea580c', glow: 'rgba(249, 115, 22, 0.45)', bg: 'rgba(249, 115, 22, 0.08)' },
      { cor: '#fb923c', corSub: '#f97316', glow: 'rgba(251, 146, 60, 0.45)', bg: 'rgba(251, 146, 60, 0.08)' }
    ]
  };

  infoTrilha(caminhoNome: string, index: number) {
    const lista = this.coresTrilhas[caminhoNome] ?? this.coresTrilhas['Caminho Eidolon'];
    return lista[index % lista.length];
  }

  // chave = "Caminho::Trilha" -> quantidade de nós comprados em ordem (0 a 8)
  comprasPorTrilha = signal<Record<string, number>>({});

  private trilhaKey(caminho: string, trilha: string): string {
    return `${caminho}::${trilha}`;
  }

  nosComprados(caminho: string, trilha: string): number {
    return this.comprasPorTrilha()[this.trilhaKey(caminho, trilha)] ?? 0;
  }

  tracosGastos = computed(() => {
    const compras = this.comprasPorTrilha();
    return Object.values(compras).reduce((soma, v) => soma + v, 0);
  });

  tracosRestantes = computed(() => this.tracosRevelacao() - this.tracosGastos());

  private valorAtributoCaminho(atributo: Caminho['atributo']): number {
    switch (atributo) {
      case 'vigor': return this.vigorTotal();
      case 'acuidade': return this.acuidadeTotal();
      case 'psicometria': return this.psicometriaTotal();
      case 'esoterismo': return this.esoterismoTotal();
      case 'razao': return this.razaoTotal();
    }
  }

  // por que um nó específico (posição 0-indexada) ainda não pode ser comprado
  motivoBloqueio(caminho: Caminho, trilha: Trilha, posicao: number): string | null {
    const comprados = this.nosComprados(caminho.nome, trilha.nome);
    if (posicao > comprados) return 'Requer os nós anteriores desta trilha';
    if (posicao < comprados) return null; // já comprado
    const no = trilha.nos[posicao];
    if (this.nivel() < no.nivel) return `Requer Nível ${no.nivel}`;
    const atributoVal = this.valorAtributoCaminho(caminho.atributo);
    if (posicao >= 6 && atributoVal < 5) return `Requer 5+ em ${caminho.atributo.toUpperCase()}`;
    if (posicao >= 4 && atributoVal < 3) return `Requer 3+ em ${caminho.atributo.toUpperCase()}`;
    if (this.tracosRestantes() < 1) return 'Sem Traços de Revelação disponíveis';
    return null;
  }

  comprarNo(caminho: Caminho, trilha: Trilha) {
    const comprados = this.nosComprados(caminho.nome, trilha.nome);
    if (comprados >= trilha.nos.length) return;
    if (this.motivoBloqueio(caminho, trilha, comprados) !== null) return;
    const key = this.trilhaKey(caminho.nome, trilha.nome);
    this.comprasPorTrilha.update(map => ({ ...map, [key]: comprados + 1 }));
  }

  desfazerNo(caminho: Caminho, trilha: Trilha) {
    const key = this.trilhaKey(caminho.nome, trilha.nome);
    const comprados = this.nosComprados(caminho.nome, trilha.nome);
    if (comprados <= 0) return;
    this.comprasPorTrilha.update(map => ({ ...map, [key]: comprados - 1 }));
  }

  atributoLabels: { chave: AtributoChave; label: string; classe: string; desc: string }[] = [
    { chave: 'vigor', label: 'VIGOR', classe: 'attr-vigor', desc: 'Desempenho físico, força e vigor corporal' },
    { chave: 'acuidade', label: 'ACUIDADE', classe: 'attr-acuidade', desc: 'Minuciosidade, reflexos, pontaria e destreza' },
    { chave: 'psicometria', label: 'PSICOMETRIA', classe: 'attr-psicometria', desc: 'Fatores cognitivos, intelecto e desenvoltura social' },
    { chave: 'esoterismo', label: 'ESOTERISMO', classe: 'attr-esoterismo', desc: 'Afinidade com o Indizível, rituais e magias' },
    { chave: 'razao', label: 'RAZÃO', classe: 'attr-razao', desc: 'Resistência mental contra o Indizível e sanidade' }
  ];

  // --- Tabelas de referência rápida do livro ---
  tabelaDificuldades = [
    { df: 1, min: 10 }, { df: 2, min: 12 }, { df: 3, min: 14 },
    { df: 4, min: 16 }, { df: 5, min: 18 }, { df: 6, min: 19 },
    { df: 7, min: 20 }, { df: 8, min: 24 }, { df: 9, min: 26 },
    { df: 10, min: 30 }
  ];

  getDificuldadeDesc(df: number): string {
    const descs: Record<number, string> = {
      1: 'Fácil (Ações de rotina sob pressão)',
      2: 'Média (Desafio padrão)',
      3: 'Complicada (Requer boa perícia)',
      4: 'Difícil (Condições adversas)',
      5: 'Muito Difícil (Desafio extremo)',
      6: 'Formidável (No limite humano)',
      7: 'Heroica (Praticamente impossível)',
      8: 'Sobrenatural (Requer o oculto)',
      9: 'Quase Impossível (Maravilha)',
      10: 'Impossível (Apenas com milagre)'
    };
    return descs[df] ?? 'Desafio Extremo';
  }

  tabelaSanidadeNegativa = [
    { faixa: '-1 a -10', efeito: 'Casos de Paranoia Severa e Alucinações' },
    { faixa: '-11 a -20', efeito: 'Casos de Psicose Grave e Agressividade' },
    { faixa: '-21 a -30', efeito: 'Perda de Memória, Dificuldade Motora (-1 ACUIDADE)' },
    { faixa: '-31 a -40', efeito: 'Toques Fantasmas, Episódios de Devaneios e Incapacidade de Fala' },
    { faixa: '-41 a -50', efeito: 'Dano Cerebral Permanente (-5 em todos os testes)' },
    { faixa: '-51 a -60', efeito: 'Dano Cerebral Grave Permanente (-8 em todos os testes)' },
    { faixa: '-61 a -70', efeito: 'Irrecuperável' },
    { faixa: '-71 a -100', efeito: 'Morte Cerebral' }
  ];

  armasCorpoACorpo = [
    { nome: 'Facas', dano: '1d4 + 1 Tick Sangramento', cor: '#38bdf8' },
    { nome: 'Martelos', dano: '1d6 + Chance Stun por 1 turno', cor: '#fb923c' },
    { nome: 'Grifos', dano: '2d6', cor: '#c084fc' },
    { nome: 'Machados', dano: '3d6', cor: '#ff3848' },
    { nome: 'Canos de Metal', dano: '3d4', cor: '#00e5a3' },
    { nome: 'Cadeiras / Mesas', dano: '4d4 (Uso único)', cor: '#38bdf8' },
    { nome: 'Objeto do Cenário', dano: '1d4 (Pequeno) / 1d6 (Médio) / 1d8 (Grande)', cor: '#fb923c' }
  ];

  armasDistancia = [
    { nome: 'Estilingue', dano: '1d6', tiros: 'Até 4 tiros/turno', cor: '#00e5a3' },
    { nome: 'Revólver .38', dano: '1d8', tiros: 'Até 6 tiros/turno', cor: '#38bdf8' },
    { nome: 'Revólver .44', dano: '1d12', tiros: 'Até 6 tiros/turno', cor: '#38bdf8' },
    { nome: 'Revólver .45', dano: '2d8', tiros: 'Até 6 tiros/turno', cor: '#38bdf8' },
    { nome: 'Revólver .357', dano: '2d12', tiros: 'Até 5 tiros/turno', cor: '#818cf8' },
    { nome: 'Espingarda', dano: '5d4', tiros: '2 tiros/turno', cor: '#c084fc' },
    { nome: 'Espingarda (EX)', dano: '3d8', tiros: '2 tiros/turno', cor: '#ff3848' },
    { nome: 'Espingarda (BL)', dano: '3d12', tiros: '1 tiro/turno', cor: '#f472b6' },
    { nome: 'Mini-Metralhadora', dano: '1d4', tiros: 'Até 16 tiros/turno', cor: '#fb923c' },
    { nome: 'Submetralhadora', dano: '1d8', tiros: 'Até 16 tiros/turno', cor: '#fbbf24' },
    { nome: 'Metralhadora Pesada', dano: '2d8', tiros: 'Até 32 tiros/turno', cor: '#ff3848' },
    { nome: 'Winchester .22', dano: '3d10', tiros: 'Até 5 tiros/turno', cor: '#fbbf24' },
    { nome: 'Winchester .30-30', dano: '3d12', tiros: '1 tiro/turno', cor: '#00e5a3' },
    { nome: 'Remington .30-06', dano: '4d12', tiros: '1 tiro/turno', cor: '#00e5a3' },
    { nome: '.222 Remington', dano: '2d20', tiros: '1 tiro/turno', cor: '#f8fafc' },
    { nome: '.270 Winchester', dano: '3d20', tiros: '1 tiro/turno', cor: '#c084fc' },
    { nome: 'Springfield .30-06', dano: '4d20', tiros: '1 tiro a cada 2 turnos', cor: '#ff3848' },
    { nome: 'Fuzil de Caça', dano: '2d6', tiros: 'Até 12 tiros/turno', cor: '#fbbf24' },
    { nome: 'Fuzil de Assalto', dano: '3d8', tiros: 'Até 12 tiros/turno', cor: '#f8fafc' },
    { nome: 'Arcos', dano: '1d12', tiros: 'Até 3 disparos/turno', cor: '#00e5a3' }
  ];

  itensMedicinais = [
    { nome: 'Gaze', efeito: 'Recupera 1d4 de Vida', cor: '#38bdf8' },
    { nome: 'Esparadrapos', efeito: 'Remove Tick de Sangramento', cor: '#fb923c' },
    { nome: 'Antisséptico', efeito: 'Remove Tick de Infecção', cor: '#c084fc' },
    { nome: 'Água Oxigenada', efeito: 'Remove todos os Ticks de Infecção; causa -1d4 de Vida', cor: '#f472b6' },
    { nome: 'Kit de Sutura', efeito: 'Fecha feridas abertas', cor: '#ff3848' },
    { nome: 'Alicate', efeito: 'Remove estilhaços cravados na carne', cor: '#00e5a3' },
    { nome: 'Prozac', efeito: 'Tratamento da depressão', cor: '#f472b6' },
    { nome: 'Zoloft', efeito: 'Tratamento de depressão grave', cor: '#00e5a3' },
    { nome: 'Ziprasidona', efeito: 'Controle da esquizofrenia', cor: '#fb923c' },
    { nome: 'Clonazepam', efeito: 'Controle da ansiedade', cor: '#38bdf8' }
  ];

  itensPsicoativos = [
    { nome: 'Cigarros Baratos', efeito: 'Recupera 1d4 Sanidade (1% chance Câncer)', cor: '#fb923c' },
    { nome: 'Cigarros de Marca', efeito: 'Recupera 1d8 Sanidade (2% chance Câncer)', cor: '#f472b6' },
    { nome: 'Charuto', efeito: 'Recupera 1d12 Sanidade (3% chance Câncer)', cor: '#fbbf24' },
    { nome: 'Narguilé', efeito: 'Recupera 3d12 Sanidade (10% chance Câncer)', cor: '#00e5a3' },
    { nome: 'Balinha de LSD', efeito: 'Recupera 2d8 Sanidade (5 min de alucinações)', cor: '#ff3848' },
    { nome: 'Pino de Cocaína', efeito: 'Recupera 1d8 Sanidade (5 min de irritabilidade)', cor: '#38bdf8' },
    { nome: 'Seringa de Fentanila', efeito: 'Recupera 3d12 Sanidade (30% chance Blackout por 1 min)', cor: '#ff3848' },
    { nome: 'Pedra de Crack', efeito: 'Recupera a Sanidade inteira (alucinação severa por 10 min)', cor: '#c084fc' },
    { nome: 'Pílula de MD', efeito: 'Anula perda de sanidade por exposição', cor: '#f8fafc' },
    { nome: 'Adesivo de Nicotina', efeito: 'Recupera 1d6 Sanidade, alivia ansiedade (demora 1 min)', cor: '#00e5a3' },
    { nome: 'Bebidas Alcoólicas', efeito: 'Recupera 1d12 Sanidade (3 seguidas aplica Embriagado)', cor: '#f8fafc' }
  ];
}
