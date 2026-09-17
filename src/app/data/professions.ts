export interface Profissao {
  nome: string;
  bonus: string;
  equipamento: string;
  dinheiro: string;
}

export const PROFISSOES: Profissao[] = [
  { nome: 'Nenhuma', bonus: '—', equipamento: '—', dinheiro: '—' },
  { nome: 'Policial', bonus: '+2 ACUIDADE, +1 RAZÃO', equipamento: 'Revólver .38, Distintivo', dinheiro: '1d20' },
  { nome: 'Médico', bonus: '+2 PSICOMETRIA (Inteligência), +1 Sanidade máxima', equipamento: 'Kit Médico', dinheiro: '1d30' },
  { nome: 'Jornalista', bonus: '+2 PSICOMETRIA (Sapiência), +1 ACUIDADE', equipamento: 'Câmera Fotográfica', dinheiro: '1d12' },
  { nome: 'Professor', bonus: '+3 PSICOMETRIA (Inteligência), -1 VIGOR', equipamento: 'Não começa com nada', dinheiro: '1d10' },
  { nome: 'Mecânico', bonus: '+2 ACUIDADE, +1 VIGOR', equipamento: 'Pé de Cabra', dinheiro: '1d15' },
  { nome: 'Bombeiro', bonus: '+2 VIGOR, +1 ACUIDADE', equipamento: 'Machado', dinheiro: '1d10' },
  { nome: 'Artista', bonus: '+3 PSICOMETRIA (Sapiência), -1 RAZÃO', equipamento: 'Não começa com nada extra', dinheiro: '1d8' },
  { nome: 'Sacerdote', bonus: '+2 RAZÃO, +1 ESOTERISMO, (Habilidade) Sermão', equipamento: 'Nenhum', dinheiro: '1d6' },
  { nome: 'Carpinteiro', bonus: '+2 VIGOR, +1 ACUIDADE, -1 PSICOMETRIA', equipamento: 'Martelo', dinheiro: '1d12' },
  { nome: 'Psicólogo', bonus: '+2 PSICOMETRIA (Sapiência), +1 Recuperação em Terapia, (Habilidade) Sessão de Terapia', equipamento: 'Nenhum', dinheiro: '1d20' },
  { nome: 'Comerciante', bonus: '+2 PSICOMETRIA (Sapiência)', equipamento: '5x Itens Psicoativos', dinheiro: '2d20' },
  { nome: 'Coveiro', bonus: '+1 RAZÃO, +1 ESOTERISMO', equipamento: 'Pá, Velas', dinheiro: '1d6' },
  { nome: 'Eletricista', bonus: '+2 ACUIDADE, +1 PSICOMETRIA (Inteligência), -1 ESOTERISMO', equipamento: 'Chave Inglesa', dinheiro: '1d15' },
  { nome: 'Advogado', bonus: '+2 PSICOMETRIA (Sapiência), +1 em Testes Sociais', equipamento: 'Pasta', dinheiro: '1d25' },
  { nome: 'Caçador', bonus: '+2 VIGOR, +1 ACUIDADE', equipamento: 'Rifle .30-30, Faca de Caça', dinheiro: '1d8' },
  { nome: 'Músico', bonus: '+2 PSICOMETRIA (Sapiência), -1 RAZÃO', equipamento: 'Instrumento Musical', dinheiro: '1d6' },
  { nome: 'Enfermeiro', bonus: '+2 PSICOMETRIA (Inteligência), +1 Sanidade máxima', equipamento: 'Kit Médico, Seringas', dinheiro: '1d12' },
  { nome: 'Apostador', bonus: '+3 PSICOMETRIA (Sapiência), -1 VIGOR', equipamento: 'Canivete Stiletto', dinheiro: '2d15' },
  { nome: 'Bibliotecário', bonus: '+3 PSICOMETRIA (Inteligência), -1 VIGOR', equipamento: 'Livro Raro', dinheiro: '1d8' },
  { nome: 'Veterano', bonus: 'Vantagem em RAZÃO e ACUIDADE, +2 Armas de Fogo', equipamento: 'Arma à escolha', dinheiro: '1d16' },
  { nome: 'Pesquisador', bonus: '+3 PSICOMETRIA (Inteligência), -1 VIGOR', equipamento: 'Não começa com nada', dinheiro: '1d18' },
  { nome: 'Detetive', bonus: '+2 ACUIDADE, +1 PSICOMETRIA (Sapiência)', equipamento: 'Revólver, Distintivo Falso', dinheiro: '1d20' },
  { nome: 'Motorista', bonus: '+2 ACUIDADE, +1 VIGOR', equipamento: 'Carro, Chaves', dinheiro: '1d10' },
  { nome: 'Fotógrafo', bonus: '+2 ACUIDADE, +1 PSICOMETRIA (Inteligência)', equipamento: 'Câmera Profissional com Flash de 8000 J', dinheiro: '1d12' },
  { nome: 'Fazendeiro', bonus: '+2 VIGOR, +2 RAZÃO', equipamento: 'Winchester .22', dinheiro: '1d10' },
  { nome: 'Farmacêutico', bonus: '+2 PSICOMETRIA (Inteligência), +1 em Itens Psicoativos', equipamento: 'Conjunto de Tratamento Mental', dinheiro: '1d16' },
  { nome: 'Historiador', bonus: '+2 PSICOMETRIA (Inteligência), +1 ESOTERISMO', equipamento: 'Atlas, Bússola', dinheiro: '1d10' },
  { nome: 'Criminoso Reformado', bonus: '+2 VIGOR, +1 em Esquiva', equipamento: 'Arma Improvisada, Gazuas', dinheiro: '1d6' },
  { nome: 'Ocultista', bonus: '+3 ESOTERISMO, -1 RAZÃO', equipamento: 'Carta de Prece', dinheiro: '1d8' },
  { nome: 'Consultor', bonus: '+2 PSICOMETRIA (Sapiência)', equipamento: 'Não começa com nada', dinheiro: '2d20' },
  { nome: 'Atleta', bonus: '+2 VIGOR, +1d4 de Fôlego na criação', equipamento: 'Não começa com nada', dinheiro: '2d20' },
  { nome: 'Bom-pra-nada', bonus: '+4 ESOTERISMO', equipamento: 'Não começa com nada', dinheiro: '0' }
];
