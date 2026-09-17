export interface No {
  nome: string;
  nivel: number; // nível mínimo de Perito exigido
  efeito: string;
}

export interface Trilha {
  nome: string;
  nos: No[]; // sempre 8 nós, ordem obrigatória
}

export interface Caminho {
  nome: string;
  atributo: 'vigor' | 'acuidade' | 'psicometria' | 'esoterismo' | 'razao';
  trilhas: Trilha[];
}

export const CAMINHOS: Caminho[] = [
  {
    nome: 'Caminho Eidolon',
    atributo: 'vigor',
    trilhas: [
      {
        nome: 'Trilha da Resiliência',
        nos: [
          { nome: 'Casca Grossa', nivel: 1, efeito: 'Vantagem no teste de VIGOR para não perder 1 Ponto de Vida por turno ao chegar a 0 de Vida.' },
          { nome: 'Bloqueio Perfeito', nivel: 2, efeito: 'Ao defender, o teste de VIGOR DF6 para receber metade do dano ganha +2 no resultado.' },
          { nome: 'Couro Endurecido', nivel: 3, efeito: 'Adiciona permanentemente +3 à fórmula base de Vida (VIGOR + 10).' },
          { nome: 'Sangue Frio', nivel: 5, efeito: 'Ignora a penalidade de -2 no atributo VIGOR causada pelo status Câncer.' },
          { nome: 'Defesa Absoluta', nivel: 7, efeito: 'Um sucesso normal no teste de VIGOR DF6 da Defesa anula todo o dano inimigo, sem exigir 20 natural.' },
          { nome: 'Muralha de Carne', nivel: 9, efeito: 'Ganha vantagem no teste de Contra-ação DF5 quando usa VIGOR para escapar.' },
          { nome: 'Imortalidade Brutal', nivel: 12, efeito: 'Se passar de -5 de Vida, um acerto crítico (20) no teste de VIGOR estabiliza a Vida em -4.' },
          { nome: 'Carcaça Indiferente', nivel: 15, efeito: 'Ignora todas as penalidades de dano passivo (sangramento, queimadura, veneno e afins).' }
        ]
      },
      {
        nome: 'Trilha do Fôlego',
        nos: [
          { nome: 'Fôlego de Ferro', nivel: 1, efeito: 'Recupera 2 Pontos de Fôlego a cada 15 minutos, ao invés de apenas 1.' },
          { nome: 'Salto Espectral', nivel: 2, efeito: 'Pular ou escalar passa a custar apenas 1 Ponto de Fôlego, ao invés de 2.' },
          { nome: 'Explosão Adrenalínica', nivel: 3, efeito: '1 Ponto de Fôlego permite correr 10m sem teste, dobrando a distância base de 5m.' },
          { nome: 'Passada Inumana', nivel: 5, efeito: 'O turno de Movimentação permite caminhar 20m sem gastar Fôlego ou realizar testes.' },
          { nome: 'Força Descomunal', nivel: 7, efeito: 'Ao gastar Fôlego para pagar a Dificuldade de um teste de força, o custo é cortado pela metade.' },
          { nome: 'Segundo Pulmão', nivel: 9, efeito: 'Uma vez por cena, ao zerar o fôlego, anula a penalidade de -[VIGOR] da Exaustão por 3 turnos.' },
          { nome: 'Metabolismo Infinito', nivel: 12, efeito: 'O limite máximo de Pontos de Fôlego do Perito recebe +3.' },
          { nome: 'Máquina sem Descanso', nivel: 15, efeito: 'Zera a necessidade de 1 hora ou mais de descanso para sair do estado de exaustão.' }
        ]
      },
      {
        nome: 'Trilha da Ultraviolência',
        nos: [
          { nome: 'Punho de Chumbo', nivel: 1, efeito: 'Adiciona um teste de dano novamente como dano extra em ataques desarmados.' },
          { nome: 'Esmagamento Crítico', nivel: 2, efeito: 'Acertos críticos em combate desarmado ou com armas cegas dobram o bônus de VIGOR no dano.' },
          { nome: 'Primeiro Golpe', nivel: 3, efeito: 'Vantagem no teste de acerto do primeiro turno de qualquer combate.' },
          { nome: 'Fúria Reativa', nivel: 5, efeito: 'Ganha +1 Ação de ataque no turno seguinte, caso tenha sofrido dano no turno anterior.' },
          { nome: 'Impacto Sísmico', nivel: 7, efeito: 'Um ataque crítico empurra o alvo 5 metros para trás, derrubando-o se colidir.' },
          { nome: 'Teimosia Bruta', nivel: 9, efeito: 'Todo resultado 1 na rolagem de dano físico é automaticamente convertido em 5.' },
          { nome: 'Quebra-Guarda', nivel: 12, efeito: 'Ataques do Perito ignoram completamente bloqueios e defesas passivas do alvo.' },
          { nome: 'Sentença de Carne', nivel: 15, efeito: 'Pode trocar suas 2 ações do turno por um único acerto automático, sem teste.' }
        ]
      },
      {
        nome: 'Trilha da Carne Adaptável',
        nos: [
          { nome: 'Limiar Rompido', nivel: 1, efeito: 'A Vida Máxima do Perito pode ultrapassar o teto definido na criação de ficha.' },
          { nome: 'Crescimento Anômalo', nivel: 2, efeito: 'Recebe +1d4 extra de Vida a cada nível de Conhecimento completado.' },
          { nome: 'Coágulo Instantâneo', nivel: 3, efeito: 'Imunidade total a sangramento e a perda contínua de Vida por ferimentos abertos.' },
          { nome: 'Pele de Osso', nivel: 5, efeito: 'Reduz em 1 o dano de todo e qualquer ataque recebido.' },
          { nome: 'Marcha Infinita', nivel: 7, efeito: 'Ignora a dificuldade adicional gerada por distância extra na locomoção em combate.' },
          { nome: 'Predador Voraz', nivel: 9, efeito: 'Ganha +1 Ponto de Fôlego cada vez que abate um inimigo.' },
          { nome: 'Transfusão Profana', nivel: 12, efeito: 'Pode converter qualquer cura de Sanidade recebida em cura de Vida, ponto a ponto.' },
          { nome: 'Escudo de Carne', nivel: 15, efeito: 'Pode assumir o dano destinado a um aliado adjacente, recebendo-o integralmente.' }
        ]
      }
    ]
  },
  {
    nome: 'Caminho Profético',
    atributo: 'acuidade',
    trilhas: [
      {
        nome: 'Trilha da Iniciativa',
        nos: [
          { nome: 'Reflexos Afiados', nivel: 1, efeito: 'Ganha +2 de bônus na rolagem de ACUIDADE que define a ordem de Iniciativa.' },
          { nome: 'Premonição', nivel: 2, efeito: 'Em caso de empate na Iniciativa, o Perito é sempre o primeiro a agir, ignorando a decisão do grupo.' },
          { nome: 'Contra-ação Precisa', nivel: 3, efeito: 'Rola o teste de Contra-ação DF5 com Vantagem sempre que usar ACUIDADE.' },
          { nome: 'Janela Aberta', nivel: 5, efeito: 'Um acerto crítico na Contra-ação concede +2 Ações Bônus, ao invés de apenas 1.' },
          { nome: 'Abertura Profética', nivel: 7, efeito: 'Todos os inimigos rolam o primeiro teste de acerto do combate com desvantagem.' },
          { nome: 'Leitura de Movimento', nivel: 9, efeito: 'Pode substituir VIGOR por ACUIDADE no teste DF6 de redução de dano da Defesa.' },
          { nome: 'Nunca Surpreso', nivel: 12, efeito: 'Age normalmente no primeiro turno mesmo em emboscadas ou situações de surpresa.' },
          { nome: 'Interrupção', nivel: 15, efeito: 'Gaste 1 Ação Bônus para interromper e cancelar um ataque inimigo declarado contra você.' }
        ]
      },
      {
        nome: 'Trilha da Percepção',
        nos: [
          { nome: 'Olhos de Águia', nivel: 1, efeito: 'Vantagem em testes de ACUIDADE para encontrar objetos ocultos, perdidos ou investigar cenas.' },
          { nome: 'Mãos Leves', nivel: 2, efeito: 'Arrombar fechaduras e consertar objetos pequenos passa a consumir apenas 1 Ação Bônus.' },
          { nome: 'Rastreio Obcecado', nivel: 3, efeito: 'Não sofre penalidades em testes de ACUIDADE de procura, mesmo em estado de Exaustão.' },
          { nome: 'Socorrista Rápido', nivel: 5, efeito: 'Vantagem no teste de ACUIDADE para impedir a morte de um aliado com a Vida zerada.' },
          { nome: 'Foco Etílico', nivel: 7, efeito: 'Anula a penalidade de -2 em ACUIDADE causada pelo status Embriagado.' },
          { nome: 'Vista Noturna', nivel: 9, efeito: 'Enxerga normalmente em escuridão parcial e não sofre penalidade por pouca iluminação.' },
          { nome: 'Cálculo Frio', nivel: 12, efeito: 'O Espectador deve revelar a Dificuldade exata de um teste antes que o Perito role o dado.' },
          { nome: 'Quase Certo', nivel: 15, efeito: 'Falhas normais (não críticas) em testes de ACUIDADE contam como sucesso parcial, a critério do Espectador.' }
        ]
      },
      {
        nome: 'Trilha do Atirador',
        nos: [
          { nome: 'Gatilho Firme', nivel: 1, efeito: 'Numa Falha Crítica (1) com armas de fogo, gaste 2 de Fôlego para rerrolar e aceitar o novo resultado.' },
          { nome: 'Calibre Pesado', nivel: 2, efeito: 'Todo ataque bem sucedido com armas de fogo causa +2 de dano.' },
          { nome: 'Recarga Súbita', nivel: 3, efeito: 'Recarregar armas de fogo exige apenas 1 Ação Bônus, ao invés de 1 Ação completa.' },
          { nome: 'Tiro de Sorte', nivel: 5, efeito: 'Uma vez por sessão, pode forçar um acerto normal de arma a se tornar Acerto Crítico (dano máximo).' },
          { nome: 'Disparo de Cobertura', nivel: 7, efeito: 'Gaste 1 Ação Bônus: o próximo inimigo a atacar rola com Desvantagem.' },
          { nome: 'Ângulo Impossível', nivel: 9, efeito: 'Ignora completamente meia-cobertura inimiga no cálculo da Dificuldade do disparo.' },
          { nome: 'Crítico Sanguinário', nivel: 12, efeito: 'Acertos críticos com armas de fogo causam o dano máximo + 1d6 extra.' },
          { nome: 'Reflexo Ofensivo', nivel: 15, efeito: 'Um 20 natural na Contra-ação DF5 concede uma Ação Bônus que pode ser gasta num disparo imediato.' }
        ]
      },
      {
        nome: 'Trilha da Evasão',
        nos: [
          { nome: 'Passo Silencioso', nivel: 1, efeito: 'Todos os testes de furtividade são rolados com Vantagem.' },
          { nome: 'Alvo Escorregadio', nivel: 2, efeito: 'A Dificuldade da Contra-ação do inimigo contra suas ações sobe de DF6 para DF8.' },
          { nome: 'Reposicionamento', nivel: 3, efeito: 'Pode se mover 5m gratuitamente por turno sem provocar ataques de oportunidade.' },
          { nome: 'Memória Muscular', nivel: 5, efeito: 'Ignora a penalidade de -1 em ACUIDADE causada por Perda de Memória (-21 a -30 de Sanidade).' },
          { nome: 'Queda Controlada', nivel: 7, efeito: 'Todo dano de queda sofrido é reduzido à metade, arredondando para baixo.' },
          { nome: 'Esquiva Instintiva', nivel: 9, efeito: 'Esquivar deixa de consumir Ação ou Ação Bônus do turno.' },
          { nome: 'Isca Falsa', nivel: 12, efeito: 'Gaste 1 Ação Bônus para criar uma distração: um inimigo perde o alvo até o próximo turno.' },
          { nome: 'Ponto Cego', nivel: 15, efeito: 'Se permanecer imóvel por um turno completo, torna-se efetivamente invisível por 1 turno.' }
        ]
      }
    ]
  },
  {
    nome: 'Caminho Real',
    atributo: 'psicometria',
    trilhas: [
      {
        nome: 'Trilha da Sapiência',
        nos: [
          { nome: 'Sinergia Cognitiva', nivel: 1, efeito: 'A penalidade do sub-atributo secundário de PSICOMETRIA é reduzida de -3 para -1.' },
          { nome: 'Lábia Inabalável', nivel: 2, efeito: 'Vantagem em persuadir ou perceber mentiras. Falhar custa 1d4 de Sanidade pela frustração.' },
          { nome: 'Comando Social', nivel: 3, efeito: 'Pode anular a falha de um aliado no teste de ficar para trás causado pela Depressão Leve.' },
          { nome: 'Oratória de Batalha', nivel: 5, efeito: 'Gaste 1 Ação Bônus para conceder +1 no teste de Acerto de um aliado próximo.' },
          { nome: 'Réplica Afiada', nivel: 7, efeito: 'Vantagem em toda Contra-ação de natureza social, verbal ou de intimidação.' },
          { nome: 'Consenso Forçado', nivel: 9, efeito: 'Anula testes obrigatórios em grupo impostos por distúrbios mentais dos aliados.' },
          { nome: 'Diplomacia Blasfema', nivel: 12, efeito: 'Pode convencer Indizíveis de nível menor que o seu a recuar sem combate.' },
          { nome: 'Voz de Comando', nivel: 15, efeito: 'Uma vez por sessão, dita uma ordem absoluta: um alvo obedece por 1 turno completo.' }
        ]
      },
      {
        nome: 'Trilha da Inteligência',
        nos: [
          { nome: 'Mente Analítica', nivel: 1, efeito: 'Gaste 1 Ponto de Fôlego para reduzir a Dificuldade ao decifrar criptografias e padrões.' },
          { nome: 'Alquimista Prático', nivel: 2, efeito: 'Anula a extrema dificuldade de usar itens medicinais sob Esquizofrenia Hebefrênica.' },
          { nome: 'Invasão Silenciosa', nivel: 3, efeito: 'Invadir sistemas, redes elétricas e computadores passa a consumir apenas 1 Ação Bônus.' },
          { nome: 'Memória Fotográfica', nivel: 5, efeito: 'Lembra com perfeição de qualquer detalhe de cenário já descrito pelo Espectador.' },
          { nome: 'Leitura de Fraqueza', nivel: 7, efeito: 'Gaste 1 Ação para que o Espectador revele uma fraqueza concreta de um inimigo.' },
          { nome: 'Segunda Dedução', nivel: 9, efeito: 'Pode rerrolar qualquer teste de dedução ou identificação de padrões, uma vez por cena.' },
          { nome: 'Erudição Absoluta', nivel: 12, efeito: 'O reforço total do sub-atributo Inteligência recebe +2 permanentes.' },
          { nome: 'Improviso Técnico', nivel: 15, efeito: 'Ignora enguiços, falhas e limitações tecnológicas de qualquer equipamento em uso.' }
        ]
      },
      {
        nome: 'Trilha da Terapia',
        nos: [
          { nome: 'Escuta Ativa', nivel: 1, efeito: 'Uma sessão de Terapia passa a restaurar 1d6+2 Pontos de Sanidade, ao invés de 1d6.' },
          { nome: 'Empatia Terapêutica', nivel: 2, efeito: 'Rolagens 1 e 2 no 1d6 de uma sessão de Terapia viram automaticamente 3.' },
          { nome: 'Terapia de Grupo', nivel: 3, efeito: 'Uma única sessão de Terapia passa a afetar 2 aliados ao mesmo tempo.' },
          { nome: 'Ancoragem', nivel: 5, efeito: 'Aliados que sofram de qualquer grau de ansiedade recuperam +2 de Sanidade extra na Terapia.' },
          { nome: 'Autoanálise', nivel: 7, efeito: 'O Perito pode aplicar uma sessão de Terapia em si mesmo, com efeito integral.' },
          { nome: 'Alta Médica', nivel: 9, efeito: 'Um acerto crítico no 1d6 da Terapia remove permanentemente 1 Distúrbio do paciente.' },
          { nome: 'Respiro Coletivo', nivel: 12, efeito: 'Toda sessão de Terapia também restaura 2 Pontos de Fôlego a quem a recebe.' },
          { nome: 'Plantão Eterno', nivel: 15, efeito: 'Deixa de existir o limite de uma sessão de Terapia por sessão de jogo.' }
        ]
      },
      {
        nome: 'Trilha do Foco Mental',
        nos: [
          { nome: 'Foco na Crise', nivel: 1, efeito: 'Contorna a insônia da Ansiedade Moderada, recebendo 100% do descanso longo ao invés de 50%.' },
          { nome: 'Máscara Social', nivel: 2, efeito: 'Não sofre a penalidade de interação social imposta pela Ansiedade Grave.' },
          { nome: 'Âncora Racional', nivel: 3, efeito: 'Aumenta permanentemente a Sanidade Máxima do Perito em +1.' },
          { nome: 'Nunca em Branco', nivel: 5, efeito: 'Anula o efeito de Falha Crítica (1) em qualquer teste de PSICOMETRIA.' },
          { nome: 'Meditação Ativa', nivel: 7, efeito: 'Uma meditação de 5 minutos recupera 2 Pontos de Fôlego, sem necessidade de descanso.' },
          { nome: 'Muro Mental', nivel: 9, efeito: 'Bloqueia leitura mental, sugestão e influência psíquica de Indizíveis e Peritos.' },
          { nome: 'Fardo Compartilhado', nivel: 12, efeito: 'Pode dividir igualmente qualquer dano de Sanidade recebido com um aliado voluntário.' },
          { nome: 'Descrença Treinada', nivel: 15, efeito: 'Imunidade total a ilusões e alucinações induzidas de baixo nível.' }
        ]
      }
    ]
  },
  {
    nome: 'Caminho Ancião',
    atributo: 'esoterismo',
    trilhas: [
      {
        nome: 'Trilha do Conjurador',
        nos: [
          { nome: 'Empréstimo Profano', nivel: 1, efeito: 'Permite manter a Sanidade abaixo de 0 ao conjurar, recuperando ao final do combate. O Perito ainda sofre os efeitos da insanidade no processo.' },
          { nome: 'Amplificação Verbal', nivel: 2, efeito: "Cada conjunto extra de palavras na magia garante +1d6 no efeito, ao invés de +1d4." },
          { nome: 'Conhecimento Além', nivel: 3, efeito: 'Pode conjurar rituais de nível superior ao seu ESOTERISMO atual, sofrendo o dobro do dano base de Sanidade.' },
          { nome: 'Verbo Truncado', nivel: 5, efeito: 'Dispensa a Palavra de Impulso na estrutura da conjuração, exigindo apenas Verbal e Poder.' },
          { nome: 'Poder Sobre Verbo', nivel: 7, efeito: 'Pode substituir uma Palavra Verbal ausente por uma Palavra de Poder do seu repertório.' },
          { nome: 'Eco Persistente', nivel: 9, efeito: 'Dobra a duração de efeito de todas as magias conjuradas pelo Perito.' },
          { nome: 'Barganha Eficiente', nivel: 12, efeito: 'Reduz em 1 o custo de Sanidade de toda magia de Classe 3 ou superior.' },
          { nome: 'Conjuração Dupla', nivel: 15, efeito: 'Pode conjurar 2 magias de conjunto único num mesmo turno, pagando ambos os custos.' }
        ]
      },
      {
        nome: 'Trilha do Ritualista',
        nos: [
          { nome: 'Canalização Rápida', nivel: 1, efeito: 'Reduz pela metade o tempo de preparo de Rituais (desenhos, símbolos e relíquias).' },
          { nome: 'Catalisador Mental', nivel: 2, efeito: 'Ignora a necessidade física do objeto de gatilho pagando +2 pontos de Sanidade.' },
          { nome: 'Ordem Corrompida', nivel: 3, efeito: 'O Ritual funciona normalmente mesmo com 1 erro na ordem das etapas de preparo.' },
          { nome: 'Círculo Expandido', nivel: 5, efeito: 'Todo Ritual com área de efeito tem seu alcance dobrado.' },
          { nome: 'Ritual Vazio', nivel: 7, efeito: 'Anula completamente o custo material e de componentes de qualquer Ritual.' },
          { nome: 'Bênção Enferrujada', nivel: 9, efeito: 'Rituais bem sucedidos também restauram 1d6 de Vida a todos os participantes.' },
          { nome: 'Assinatura Oculta', nivel: 12, efeito: 'Esconde o rastro esotérico do Ritual, impedindo que Indizíveis o rastreiem.' },
          { nome: 'Ritual Imediato', nivel: 15, efeito: 'Uma vez por arco narrativo, executa um Ritual completo sem tempo de preparo algum.' }
        ]
      },
      {
        nome: 'Trilha do Véu',
        nos: [
          { nome: 'Sussurros Familiares', nivel: 1, efeito: 'Ignora a perda passiva de 1 ponto de Sanidade a cada 15 minutos em ambientes com indizíveis.' },
          { nome: 'Iluminação Traumática', nivel: 2, efeito: 'Ao acessar uma imagem do LIMIAR (2d20 de dano mental), role 3d20 e descarte o maior dado.' },
          { nome: 'Andarilho do Véu', nivel: 3, efeito: 'Passa a perder Sanidade periodicamente apenas quando engajado diretamente em combate com o Indizível.' },
          { nome: 'Olhar Aferidor', nivel: 5, efeito: 'Identifica o nível exato de qualquer criatura do LIMIAR apenas encarando-a.' },
          { nome: 'Verbo de Repulsa', nivel: 7, efeito: 'Gaste 1 Ação e role ESOTERISMO contra DF5 para repelir fisicamente um Indizível.' },
          { nome: 'Sangue Anátema', nivel: 9, efeito: 'O sangue do Perito queima Indizíveis: quem o atacar corpo a corpo sofre 1d6 de dano.' },
          { nome: 'Passo Fora do Véu', nivel: 12, efeito: 'Torna-se imperceptível para criaturas do LIMIAR por 1 cena, uma vez por sessão.' },
          { nome: 'Contra-Conjuração', nivel: 15, efeito: 'Absorve integralmente 1 magia inimiga por combate, anulando seu efeito.' }
        ]
      },
      {
        nome: 'Trilha do Sacrifício',
        nos: [
          { nome: 'Dízimo de Sangue', nivel: 1, efeito: 'Pode pagar custos de sanidade com Pontos de Vida, na proporção de 2 de Vida para 1 de Sanidade.' },
          { nome: 'Graça Crítica', nivel: 2, efeito: 'Um acerto crítico na conjuração zera completamente o custo de Sanidade da magia.' },
          { nome: 'Queima Vital', nivel: 3, efeito: 'Pode queimar Pontos de Fôlego no lugar de Sanidade, na proporção de 1 para 1.' },
          { nome: 'Cordeiro', nivel: 5, efeito: 'Pode sacrificar a Vida de um aliado consciente e voluntário para conjurar sem custo algum.' },
          { nome: 'Agonia Amplificada', nivel: 7, efeito: 'O dano mágico do Perito aumenta em +1 para cada 5 Pontos de Vida que lhe faltam.' },
          { nome: 'Retorno Espelhado', nivel: 9, efeito: 'Todo dano de Sanidade sofrido em combate é convertido em dano mágico na próxima magia.' },
          { nome: 'Segunda Vinda', nivel: 12, efeito: 'Ao morrer, uma magia ativa se rompe e devolve o Perito à vida com 1 Ponto de Vida. Uma vez por arco.' },
          { nome: 'Última Palavra', nivel: 15, efeito: 'Conjuração final: o Perito morre permanentemente, mas destrói por completo um único alvo.' }
        ]
      }
    ]
  },
  {
    nome: 'Caminho da Loucura',
    atributo: 'razao',
    trilhas: [
      {
        nome: 'Trilha da Epifania',
        nos: [
          { nome: 'Epifania', nivel: 1, efeito: 'Ao chegar em 100% de conhecimento, ganha 50% de chance de curar a Sanidade Total.' },
          { nome: 'Catarse', nivel: 2, efeito: 'A chance do teste de porcentagem da Epifania sobe de 50% para 100%.' },
          { nome: 'Mente Ancorada', nivel: 3, efeito: 'Se falhar no d100 da Epifania, recupera automaticamente metade da Sanidade Máxima.' },
          { nome: 'Equilibrista Nato', nivel: 5, efeito: 'Ao chegar a 0 de Sanidade, rola o teste de RAZÃO para não ficar Insano com Vantagem.' },
          { nome: 'Cicatriz Lúcida', nivel: 7, efeito: 'Ignora a penalidade de -5 em todos os testes do Dano Cerebral Permanente (-41 a -50).' },
          { nome: 'Alma Teimosa', nivel: 9, efeito: 'O dado de sanidade ao subir de nível passa a ser 1d6.' },
          { nome: 'Clareza Crescente', nivel: 12, efeito: 'Recebe +1d4 extra de Sanidade a cada nível de Conhecimento COMPLETO.' },
          { nome: 'Fio da Consciência', nivel: 15, efeito: 'Ignora a Morte Cerebral ao passar de -71, estabilizando permanentemente em -70.' }
        ]
      },
      {
        nome: 'Trilha da Paranoia e Psicose',
        nos: [
          { nome: 'Blindagem Paranóica', nivel: 1, efeito: 'Na Paranoia Severa (-1 a -10), perde Sanidade a cada 25 minutos, não mais a cada 15.' },
          { nome: 'Fúria Psicótica', nivel: 2, efeito: 'Sob Psicose Grave (-11 a -20), recebe +2 em todos os testes de Acerto em combate.' },
          { nome: 'Toque Fantasma', nivel: 3, efeito: 'Sob Toques Fantasmas (-31 a -40), pode anular 1 ataque inimigo por combate.' },
          { nome: 'Raiva Convertida', nivel: 5, efeito: 'A Agressividade converte metade do dano recebido em bônus de dano no próximo ataque.' },
          { nome: 'Vazio Concentrado', nivel: 7, efeito: 'A Perda de Memória deixa de atrapalhar e concede +2 em VIGOR pela ausência de medo.' },
          { nome: 'Primeiro Choque', nivel: 9, efeito: 'Ignora completamente o primeiro dano de Sanidade sofrido em cada combate.' },
          { nome: 'Boca Fechada', nivel: 12, efeito: 'Aliados deixam de perder Sanidade por causa das falas e surtos do Perito fora de combate.' },
          { nome: 'Loucura Restauradora', nivel: 15, efeito: 'O status Insano passa a curar 1d6 de Vida por golpe mental, ao invés de dobrar o dano.' }
        ]
      },
      {
        nome: 'Trilha do Medo',
        nos: [
          { nome: 'Motor do Caos', nivel: 1, efeito: 'Com Esquizofrenia Catatônica, ganha Vantagem no teste para agir duas vezes ao invés de travar.' },
          { nome: 'Pânico Contagioso', nivel: 2, efeito: 'A crise de 30% da Ansiedade Grave passa a ser repassada ao inimigo mais próximo.' },
          { nome: 'Peso Suportável', nivel: 3, efeito: 'A Depressão Grave deixa de exigir o teste adicional de RAZÃO contra a própria vida.' },
          { nome: 'Conselheiro Invisível', nivel: 5, efeito: 'Com Esquizofrenia Paranoide, os sussurros passam a conter uma dica real do Espectador por cena.' },
          { nome: 'Organismo Adaptado', nivel: 7, efeito: 'Os Distúrbios do Perito deixam de exigir medicação diária para não se agravarem.' },
          { nome: 'Sinfonia de Sintomas', nivel: 9, efeito: 'Ganha +1 de dano em todos os ataques para cada Distúrbio ativo que possuir.' },
          { nome: 'Contágio Mental', nivel: 12, efeito: 'Uma vez por combate, transmite um Distúrbio temporário a um alvo por 3 turnos.' },
          { nome: 'Remissão Súbita', nivel: 15, efeito: 'Uma vez por arco narrativo, cura instantaneamente 1 Distúrbio à sua escolha.' }
        ]
      },
      {
        nome: 'Trilha do Caos',
        nos: [
          { nome: 'Lucidez Corrompida', nivel: 1, efeito: 'Ao atingir o status Insano, ignora o multiplicador de 2x dano de Sanidade no próximo golpe mental.' },
          { nome: 'Psiquiatra de Si', nivel: 2, efeito: 'Anula narrativamente todos os efeitos de Desânimo Social da Depressão Leve.' },
          { nome: 'Substituição Insana', nivel: 3, efeito: 'Enquanto Insano, pode usar RAZÃO no lugar de qualquer outro atributo em testes.' },
          { nome: 'Lógica Quebrada', nivel: 5, efeito: 'Sua Contra-ação com RAZÃO passa a ser DF4, ao invés da DF5 padrão.' },
          { nome: 'Combustão Mental', nivel: 7, efeito: 'Cada ponto de dano mental recebido gera 1 Ponto de Fôlego imediatamente.' },
          { nome: 'Grito Interno', nivel: 9, efeito: 'Pode zerar todo o Fôlego atual para curar 2d6 Pontos de Sanidade.' },
          { nome: 'Iniciativa Delirante', nivel: 12, efeito: 'Com Sanidade negativa, pode rolar a Iniciativa usando RAZÃO no lugar de ACUIDADE.' },
          { nome: 'Suicídio Tático', nivel: 15, efeito: 'Ao chegar em -71 de Sanidade, o Perito colapsa e mata tudo que estiver ao seu redor.' }
        ]
      }
    ]
  }
];
