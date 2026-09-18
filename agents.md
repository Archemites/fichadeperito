# Diretrizes Gerais para Agentes de IA

Este documento serve como guia central para qualquer agente de inteligência artificial (IA) que for trabalhar ou modificar o código deste projeto (Limiar - Ficha de Perito).

## 1. Stack Tecnológico
- **Frontend**: Angular (Standalone Components, Signals, RxJS).
- **Backend**: Node.js com Express.
- **Banco de Dados**: MongoDB Atlas (acessado via API REST no backend local).
- **Estilização**: CSS puro, altamente customizado, com variáveis de tema e responsividade. Não utilizamos frameworks de CSS como Tailwind ou Bootstrap.

## 2. Padrões Arquiteturais e de Código
- **Standalone Components**: O Angular neste projeto não utiliza `NgModules`. Todos os componentes e pipes novos devem ser criados com a flag `standalone: true`.
- **Angular Signals**: O gerenciamento de estado da ficha é feito majoritariamente com `signal()` e propriedades computadas (`computed()`). Evite introduzir `BehaviorSubject` ou Redux caso não seja estritamente necessário. Siga a estrutura de atualização declarativa.
- **Requisições Assíncronas**: O backend é acessado via rotas em `http://localhost:3000/api/...`. No frontend, utilizamos `fetch` padrão dentro de funções assíncronas no arquivo principal.

## 3. Filosofia de Design e UI
- **Estética dos Anos 80 e Horror Cósmico**: A interface deve refletir uma ambientação retro-tech, investigativa e levemente macabra.
- **Tipografia**:
  - `var(--font-pixel)`: Para títulos, badges, numerações e elementos curtos de impacto.
  - `var(--font-mono)`: Para dados, atributos numéricos e valores precisos.
  - `var(--font-ui)`: Para textos de descrição mais longos, história, regras.
- **Paleta de Cores e Atributos**:
  A ficha de perito gira em torno de 5 atributos centrais, que controlam diretamente o visual dos menus e HUDs:
  - **VIGOR** (vermelho: `--color-vigor`)
  - **ACUIDADE** (verde-água: `--color-acuidade`)
  - **PSICOMETRIA** (verde brilhante: `--color-psicometria`)
  - **ESOTERISMO** (rosa/magenta: `--color-esoterismo`)
  - **RAZÃO** (azul/ciano: `--color-razao`)

## 4. Regras de Edição
- **Nunca sobrescreva estilos globais inadvertidamente**. Sempre verifique o impacto que uma alteração no CSS tem na responsividade, utilizando os media queries existentes.
- **Mantenha os SVGs inline**: Ícones geralmente são injetados de forma segura (usando o `DomSanitizer`) e mantidos dentro de arquivos de dados ou do componente para fácil edição de cores via `currentColor`.
- **Backend**: O backend atual (`server.js`) é simples. Ao mexer nele, reinicie o processo para testar as mudanças. Todas as coleções do MongoDB ficam num banco chamado "limiar_db".

## 5. Como Iniciar o Ambiente
- `node server.js` - Inicializa o backend que se comunica com o MongoDB (porta 3000).
- `ng serve` - Inicializa o servidor de desenvolvimento do Angular (geralmente porta 4200).
