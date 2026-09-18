# Orientações Específicas para o Gemini

Olá, Gemini. Quando atuar neste repositório do "Limiar" (Sistema Web de RPG de Horror Cósmico/Anos 80), considere as seguintes instruções e particularidades de integração para otimizar suas respostas. Você é frequentemente utilizado para tarefas rápidas de correção visual, prototipagem, e expansão de contexto.

Leia `agents.md` para a stack e regras básicas do projeto. As instruções abaixo são direcionadas especificamente às suas forças.

## Geração de Conteúdo e "Lore"
- Quando o usuário pedir ajuda para gerar "novos rituais", "novas profissões", ou "descrições de itens psicoativos", utilize seu vasto modelo de linguagem para propor textos que se encaixem no universo do Limiar:
  - **Tom**: Brutalidade analítica, nomes em idiomas mortos ou impronunciáveis, referências a fluidos corporais, traumas psicológicos, parasitas interdimensionais, geometria não euclidiana e tecnologia analógica dos anos 80.
  - **Balanceamento Numérico**: Tente manter as mecânicas numéricas simples (ex: +2 num teste de Vigor, custo de 3 de Sanidade).

## Interação com a Interface de Usuário
- Em muitas sessões, o usuário fará pedidos do tipo "mude a cor da aba X" ou "ajeite esse espaço em branco aqui embaixo".
- Vá direto ao ponto! Use a ferramenta de busca (`grep_search` e `view_file`) nos arquivos `src/app/app.component.html` e `src/app/app.component.css`. O usuário deste repositório odeia passos extras desnecessários e prefere ver a solução sendo injetada logo de cara.
- O CSS usa variáveis globais fortes (ex: `var(--color-esoterismo)`, `var(--bg-void)`). Sempre privilegie o uso dessas variáveis para manter a paleta consistente. Se inventar uma cor nova (ex. um gradiente), certifique-se de que ele faz sentido com a identidade visual dark mode neon-grit que a UI já possui.

## Tooling e Scripts
- Se houver necessidade de interagir com o terminal (usando ferramentas que executam shell/bash):
  - Ao subir o backend (porta 3000), rode `node server.js`. O MongoDB deve rodar de forma assíncrona, não trave o terminal de desenvolvimento principal.
  - Para o frontend, ele geralmente usa o Angular CLI localmente ou roda o servidor `ng serve`. Não mexa no servidor webpack ativamente rodando sem necessidade, faça as injeções e espere o hot reload recarregar as edições.

## Gestão de Comportamento
O usuário pode ter respostas exaltadas quando o layout quebra ou os requisitos visuais não são plenamente atendidos (Exemplo: "remove só a aba de tabelas"). Foque friamente no conserto do código, não crie discursos de pedido de desculpas muito longos. Apresente os diffs/respostas diretos ou aplique via tool.
