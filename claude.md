# Orientações Específicas para o Claude

Olá, Claude. Se você está lendo este arquivo, você foi convocado para auxiliar no desenvolvimento do sistema web de "Limiar", um RPG focado em horror cósmico com influências dos anos 80.

Além das diretrizes gerais em `agents.md`, considere as orientações abaixo:

## O Seu Perfil no Projeto
- **Paciência e Compreensão Estrutural**: O componente principal (`app.component.ts` e `.html`) atualmente consolida grande parte das regras, UI, e conexão com o backend. Isso é intencional para esta fase do MVP, para agilidade de iteração do usuário (o Mestre/Criador do jogo).
- **Abstenha-se de Over-Engineering**: Evite a tentação de refatorar este arquivo monolítico em dezenas de pequenos componentes a não ser que o usuário solicite explicitamente uma refatoração ("Refatore a aba de Combate em um componente isolado", etc.). Caso vá criar funções ou regras, adicione-as logicamente agrupadas (utilize os comentários como divisões `// --- NOME DA SEÇÃO ---`).

## Lógica do Sistema RPG (Limiar)
- A rolagem padrão de Teste é `d20 + Modificador de Atributo` vs `Dificuldade (DF)`.
- Fique atento às divisões de **Sanidade Negativa** e "Estados Mentais". A sanidade pode ir abaixo de 0, destravando efeitos passivos descritos em uma tabela específica na UI, com regras próprias de degradação.
- O sistema de **Caminhos** possui Árvores de Nós (Habilidades). Cada Caminho tem 4 Trilhas, cada trilha possui 8 Nós. O desbloqueio de nós depende do nível do personagem e se ele já possui o nó anterior (grau menor).

## Design System
- Utilize CSS Grid extensamente para layout. Flexbox para alinhamentos internos e botões.
- Siga sempre a sintaxe padrão de Angular para template control flow (como `*ngIf`, `*ngFor` ou a nova sintaxe `@if`, `@for` caso seja decidido migrar para Angular moderno em breve - pergunte ao usuário se tiver dúvidas sobre qual sintaxe ele prefere). Atualmente o código usa diretivas estruturais antigas.
- Preste atenção na estilização que o usuário adora: **degradês de néon roxo, cores vibrantes no HUD (Head-Up Display) contrastando com fundos muito escuros (`var(--bg-void)` e `var(--bg-card)`), caixas contornadas por bordas nítidas que dão sensação de "tela de computador CRT dos anos 80".**

## Instrução Operacional
Se receber um pedido que altere dados vitais de banco, como as coleções do MongoDB em `server.js`, certifique-se de não destruir os dados da coleção de `peritos` (onde as fichas dos jogadores são salvas), fornecendo scripts de atualização sem perda de dados (upsert e afins).
