import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PROFISSOES, Profissao } from './data/professions';
import { CAMINHOS, Caminho, Trilha, No } from './data/paths';

export type AtributoChave = 'vigor' | 'acuidade' | 'psicometria' | 'esoterismo' | 'razao';

export interface Atributos {
  vigor: number;
  acuidade: number;
  psicometria: number;
  esoterismo: number;
  razao: number;
}

export type AbaId = 'identidade' | 'atributos' | 'combate' | 'inventario' | 'magias' | 'caminhos' | 'regras';

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
export class AppComponent {
  profissoes = PROFISSOES;

  // --- Abas de navegação ---
  abaAtiva = signal<AbaId>('identidade');

  abas: { id: AbaId; label: string; icone: string; tag?: string }[] = [
    { id: 'identidade', label: 'Identidade', icone: '👤' },
    { id: 'atributos', label: 'Atributos', icone: '⚡' },
    { id: 'combate', label: 'Status & Combate', icone: '💀' },
    { id: 'inventario', label: 'Inventário', icone: '🎒' },
    { id: 'magias', label: 'Grimório', icone: '🔮' },
    { id: 'caminhos', label: '5 Caminhos', icone: '👁️' },
    { id: 'regras', label: 'Guia do Livro', icone: '📜' }
  ];

  selecionarAba(aba: AbaId) {
    this.abaAtiva.set(aba);
  }

  // --- Identidade ---
  nome = signal('');
  historia = signal('');
  aparencia = signal('');
  profissaoNome = signal(this.profissoes[0].nome);

  profissaoAtual = computed<Profissao>(() =>
    this.profissoes.find(p => p.nome === this.profissaoNome()) ?? this.profissoes[0]
  );

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

  pontosRestantes = computed(() => PONTOS_INICIAIS - this.pontosGastos());

  ajustarAtributo(chave: AtributoChave, delta: number) {
    const atual = { ...this.atributos() };
    const novoValor = atual[chave] + delta;
    if (novoValor < MIN_ATRIBUTO || novoValor > MAX_ATRIBUTO) return;
    if (delta > 0 && this.pontosRestantes() <= 0) return;
    atual[chave] = novoValor;
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

  vidaMaxima = computed(() => this.vigorTotal() + 10);
  folegoMaximo = computed(() => this.vigorTotal());

  // Sanidade = RAZÃO + 1d6, mínimo 2 caso razão seja baixa. Rolagem manual pelo jogador.
  ultimaRolagemSanidade = signal<number | null>(null);
  sanidadeTotal = computed(() => {
    const base = this.razaoTotal() + (this.ultimaRolagemSanidade() ?? 0);
    return Math.max(base, 2);
  });

  rolarSanidade() {
    this.ultimaRolagemSanidade.set(rollDie(6));
  }

  // --- Dinheiro / equipamento inicial ---
  dinheiroRolado = signal<number | null>(null);
  rolarDinheiro() {
    this.dinheiroRolado.set(rollFormula(this.profissaoAtual().dinheiro));
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

  sincronizarComMaximos() {
    this.vidaAtual.set(this.vidaMaxima());
    this.folegoAtual.set(this.folegoMaximo());
    this.sanidadeAtual.set(this.sanidadeTotal());
  }

  ajustarRecurso(rec: 'vida' | 'folego' | 'sanidade', delta: number) {
    if (rec === 'vida') this.vidaAtual.update(v => v + delta);
    if (rec === 'folego') this.folegoAtual.update(v => Math.max(0, Math.min(this.folegoMaximo(), v + delta)));
    if (rec === 'sanidade') this.sanidadeAtual.update(v => v + delta);
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

  conhecimentoPorcentagem = computed(() => {
    return Math.max(0, Math.min(100, this.conhecimento()));
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

  // --- Exportar / Importar ficha em JSON ---
  exportarFicha() {
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
    const blob = new Blob([JSON.stringify(ficha, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha-${(this.nome() || 'perito').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
  dificuldades = [
    { df: 1, min: 10 }, { df: 2, min: 12 }, { df: 3, min: 14 },
    { df: 4, min: 16 }, { df: 5, min: 18 }, { df: 6, min: 19 },
    { df: 7, min: 20 }, { df: 8, min: 24 }, { df: 9, min: 26 },
    { df: 10, min: 30 }
  ];

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
    { nome: 'Facas', dano: '1d4 + 1 Tick Sangramento' },
    { nome: 'Martelos', dano: '1d6 + Chance Stun por 1 turno' },
    { nome: 'Pés de Cabra', dano: '2d6' },
    { nome: 'Machados', dano: '3d6' },
    { nome: 'Canos de Metal', dano: '3d4' },
    { nome: 'Cadeiras / Mesas', dano: '4d4 (Uso único)' },
    { nome: 'Objeto do Cenário', dano: '1d4 (Pequeno) / 1d6 (Médio) / 1d8 (Grande)' }
  ];

  armasDistancia = [
    { nome: 'Estilingue', dano: '1d6', tiros: 'Até 4 tiros/turno' },
    { nome: 'Revólver .38', dano: '1d8', tiros: 'Até 6 tiros/turno' },
    { nome: 'Revólver .44', dano: '1d12', tiros: 'Até 6 tiros/turno' },
    { nome: 'Revólver .45', dano: '2d8', tiros: 'Até 6 tiros/turno' },
    { nome: 'Revólver .357', dano: '2d12', tiros: 'Até 5 tiros/turno' },
    { nome: 'Espingarda', dano: '5d4', tiros: '2 tiros/turno' },
    { nome: 'Espingarda (EX)', dano: '3d8', tiros: '2 tiros/turno' },
    { nome: 'Espingarda (BL)', dano: '3d12', tiros: '1 tiro/turno' },
    { nome: 'Mini-Metralhadora', dano: '1d4', tiros: 'Até 16 tiros/turno' },
    { nome: 'Submetralhadora', dano: '1d8', tiros: 'Até 16 tiros/turno' },
    { nome: 'Metralhadora Pesada', dano: '2d8', tiros: 'Até 32 tiros/turno' },
    { nome: 'Winchester .22', dano: '3d10', tiros: 'Até 5 tiros/turno' },
    { nome: 'Winchester .30-30', dano: '3d12', tiros: '1 tiro/turno' },
    { nome: 'Remington .30-06', dano: '4d12', tiros: '1 tiro/turno' },
    { nome: '.222 Remington', dano: '2d20', tiros: '1 tiro/turno' },
    { nome: '.270 Winchester', dano: '3d20', tiros: '1 tiro/turno' },
    { nome: 'Springfield .30-06', dano: '4d20', tiros: '1 tiro a cada 2 turnos' }
  ];

  itensMedicinais = [
    { nome: 'Gaze', efeito: 'Recupera 1d4 de Vida' },
    { nome: 'Esparadrapos', efeito: 'Remove Tick de Sangramento' },
    { nome: 'Antisséptico', efeito: 'Remove Tick de Infecção' },
    { nome: 'Água Oxigenada', efeito: 'Remove todos os Ticks de Infecção; causa -1d4 de Vida' },
    { nome: 'Kit de Sutura', efeito: 'Fecha feridas abertas' },
    { nome: 'Alicate', efeito: 'Remove estilhaços cravados na carne' },
    { nome: 'Prozac', efeito: 'Tratamento da depressão' },
    { nome: 'Zoloft', efeito: 'Tratamento de depressão grave' },
    { nome: 'Ziprasidona', efeito: 'Controle da esquizofrenia' },
    { nome: 'Clonazepam', efeito: 'Controle da ansiedade' }
  ];

  itensPsicoativos = [
    { nome: 'Cigarros Baratos', efeito: 'Recupera 1d4 Sanidade (1% chance Câncer)' },
    { nome: 'Cigarros de Marca', efeito: 'Recupera 1d8 Sanidade (2% chance Câncer)' },
    { nome: 'Charuto', efeito: 'Recupera 1d12 Sanidade (3% chance Câncer)' },
    { nome: 'Narguilé', efeito: 'Recupera 3d12 Sanidade (10% chance Câncer)' },
    { nome: 'Balinha de LSD', efeito: 'Recupera 2d8 Sanidade (5 min de alucinações)' },
    { nome: 'Pino de Cocaína', efeito: 'Recupera 1d8 Sanidade (5 min de irritabilidade)' },
    { nome: 'Seringa de Fentanila', efeito: 'Recupera 3d12 Sanidade (30% chance Blackout por 1 min)' },
    { nome: 'Pedra de Crack', efeito: 'Recupera a Sanidade inteira (alucinação severa por 10 min)' },
    { nome: 'Pílula de MD', efeito: 'Anula perda de sanidade por exposição' },
    { nome: 'Adesivo de Nicotina', efeito: 'Recupera 1d6 Sanidade, alivia ansiedade (demora 1 min)' },
    { nome: 'Bebidas Alcoólicas', efeito: 'Recupera 1d12 Sanidade (3 seguidas aplica Embriagado)' }
  ];
}
