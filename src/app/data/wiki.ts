export interface WikiTopic {
  id: string;
  title: string;
  content: string;
}

export const WIKI_DATA: WikiTopic[] = [
  {
    id: 'introducao',
    title: 'O QUE É O LIMIAR?',
    content: `
      <p>Em um mundo de deuses antigos esquecidos pelo tempo, a maioria desconhece o perigo que ronda a realidade. Criaturas vindas do LIMIAR usam de crenças populares para furar o Véu e vir para a nossa realidade. Estas são conhecidas como <strong>Indizíveis</strong> — criaturas tão grotescas e superiores que enlouquecem um ser humano comum apenas de tentar compreendê-las.</p>
      <p>Os <strong>Peritos</strong> são aqueles que decidem combater o Indizível para preservar as vidas dos inocentes. O termo não representa aptidão heroica, apenas que o indivíduo já teve contato com o paranormal e sobreviveu. Ambientado num thriller da década de 80, o universo do Limiar mescla cultura Pop com terror cósmico profundo.</p>
    `
  },
  {
    id: 'testes',
    title: 'TESTES E DIFICULDADES',
    content: `
      <p>Os testes seguem um sistema de D20: <code>1d20 + [Atributo]</code>.</p>
      <ul>
        <li><strong>Acerto Crítico (20 natural):</strong> Sucesso pleno; se for ataque, dano máximo.</li>
        <li><strong>Falha Crítico (1 natural):</strong> Pior resultado possível.</li>
        <li><strong>Vantagem / Desvantagem:</strong> Rolar dois dados e pegar o melhor (Vantagem) ou o pior (Desvantagem) resultado.</li>
        <li><strong>Testes de Porcentagem (%):</strong> Utiliza-se 1d100. Tirar abaixo do valor estipulado é sucesso. 1 é sucesso crítico, 100 é falha crítica.</li>
      </ul>
      <p>A Dificuldade dos Testes (DF) varia de 1 (Mínimo no d20 + Mod = 10) até 10 (Mínimo = 30).</p>
    `
  },
  {
    id: 'combate',
    title: 'COMBATE E AÇÕES',
    content: `
      <p>A Iniciativa é definida rolando um teste de <strong>ACUIDADE</strong> (do maior para o menor). Empates são resolvidos pelos jogadores.</p>
      <p>Em seu turno, o Perito possui: <strong>1 Ação e 1 Ação Bônus</strong>, OU pode trocar ambas por <strong>1 Movimentação Completa</strong> (andar mais de 10m sem gastar fôlego).</p>
      <h4 style="margin-top: 15px; color: var(--color-esoterismo);">Contra-Ação (Esquiva/Resistência)</h4>
      <p>Quando alvo de uma ação inimiga, o Perito tem chance de escapar rolando uma Contra-ação (DF5). O inimigo faz o mesmo contra o Perito, mas com DF6. Passar com um 20 natural em uma Contra-ação garante +1 Ação Bônus imediata.</p>
      <h4 style="margin-top: 15px; color: var(--color-esoterismo);">Defesa</h4>
      <p>Ao defender, realiza-se um teste de ACUIDADE para bloquear. Em seguida, um teste de VIGOR DF6. Em caso de sucesso, recebe-se apenas metade do dano. Um sucesso crítico anula o dano completamente.</p>
    `
  },
  {
    id: 'atributos',
    title: 'ATRIBUTOS EXPLICADOS',
    content: `
      <p><strong>VIGOR:</strong> Desempenho físico. Define a Vida (Vigor + 10) e os Pontos de Fôlego. Fôlego é usado para correr (1 pt = 5m sem teste), pular (2 pts) ou reduzir a DF de testes de força. Zerar o Fôlego causa Exaustão (penalidade de -[Vigor] em tudo e requer longo descanso).</p>
      <p><strong>ACUIDADE:</strong> Tarefas minuciosas, reflexos, iniciativa, pontaria com armas de fogo e percepção do ambiente.</p>
      <p><strong>PSICOMETRIA:</strong> Intelecto e desenvoltura social. Divide-se em <em>Inteligência</em> (tecnologia, eletrônica, dedução) e <em>Sapiência</em> (lábia, intuição, persuasão). O jogador escolhe um para receber o valor total; o outro recebe o valor do reforço com penalidade de -3.</p>
      <p><strong>ESOTERISMO:</strong> Afinidade com o Indizível. Nível de capacidade para conjurar rituais, entender anomalias e feitiços. Acesso a magias de classes altas depende estritamente deste valor.</p>
      <p><strong>RAZÃO:</strong> Resistência mental contra o Indizível. Define a Sanidade base (Razão + 1d6) e a capacidade de suportar combates com os horrores cósmicos sem perder a cabeça de imediato.</p>
    `
  },
  {
    id: 'sanidade',
    title: 'SANIDADE E TERAPIA',
    content: `
      <p>A Sanidade é o principal escudo entre você e a loucura.</p>
      <p>Ao chegar a 0 de Sanidade, o Perito realiza um teste de RAZÃO ("Se Equilibrar na Corda da Loucura"). Falhar aplica o status <strong>Insano</strong> (toma 2x de dano de sanidade). Passar estabiliza em 0.</p>
      <p>O dano progressivo negativo causa Distúrbios permanentes e perda passiva temporal (perde sanidade a cada 15 min exposto). Faixas:</p>
      <ul>
        <li><strong>-1 a -10:</strong> Paranoia e Alucinações (Esquizofrenia Paranóide).</li>
        <li><strong>-11 a -20:</strong> Psicose Grave e Agressividade.</li>
        <li><strong>-21 a -30:</strong> Perda de Memória (-1 ACU).</li>
        <li><strong>-31 a -40:</strong> Toques Fantasmas, Devaneios.</li>
        <li><strong>-41 a -60:</strong> Dano Cerebral Grave (-5 a -8 em todos os testes).</li>
        <li><strong>-71 ou pior:</strong> Morte Cerebral Permanente.</li>
      </ul>
      <h4 style="margin-top: 15px; color: var(--color-esoterismo);">Sessões de Terapia</h4>
      <p>Realizada ao final da sessão por um Perito Psicólogo (apenas 1 por sessão). Restaura <strong>1d6 de Sanidade</strong>. Terapia medicada ajuda a suprimir os efeitos agudos de distúrbios de Ansiedade, Depressão e Esquizofrenia.</p>
    `
  },
  {
    id: 'conhecimento',
    title: 'CONHECIMENTO E EVOLUÇÃO',
    content: `
      <p>O Conhecimento sobre o Indizível sobe à medida que o Perito perde Sanidade na proporção de 1:1 (Ex: Recebeu 5 de dano = Ganhou 5%). Magias conjuradas não aumentam Conhecimento, apenas danos do ambiente/monstros.</p>
      <p>Quando a barra atinge 100%, o contador zera e ocorre uma Iluminação. O Perito ganha:</p>
      <ul>
        <li><strong>+1 Traço de Revelação</strong> (Gasto para comprar um Nó em um dos 5 Caminhos).</li>
        <li><strong>+1 Ponto de Atributo</strong> livre para alocação.</li>
        <li><strong>+1d4 de Vida ou Sanidade</strong> (rolados para expandir seus máximos).</li>
      </ul>
    `
  },
  {
    id: 'magia',
    title: 'MAGIAS E RITUAIS',
    content: `
      <p>Através das Iluminações, o Perito aprende Magias do Limiar ou descobre Rituais antigos.</p>
      <h4 style="margin-top: 15px; color: var(--color-esoterismo);">Magias</h4>
      <p>Requerem estrutura verbal para invocar as forças: no mínimo 1 Palavra Verbal, 1 de Poder e 1 de Impulso.</p>
      <p>A "Classe" (de 1 a 5) da palavra mais forte proferida dita o <strong>Custo de Sanidade</strong> da magia inteira. Essa sanidade é drenada no momento da conjuração, mas é restaurada ao final do combate se o conjurador sobreviver sem desmaiar.</p>
      <p>Adicionar <em>conjuntos de palavras extras</em> amplifica o efeito da magia (+1d4 de poder bruto a cada repetição completa) mas consome +1 turno de concentração por conjunto.</p>
      <h4 style="margin-top: 15px; color: var(--color-esoterismo);">Rituais</h4>
      <p>Diferem de magias pois exigem tempo de preparo prévio, símbolos, relíquias de sacrifício e condições astrológicas precisas. Não afetam a barra de Conhecimento e costumam ter efeitos permanentes ou ambientais de larga escala.</p>
    `
  }
];
