# LIMIAR — Ficha de Perito (Angular)

App em Angular (standalone components, Angular 17) para montar a ficha de personagem do RPG **LIMIAR — 1ª Edição**.

## O que o app faz

- Identidade do Perito (nome, história, aparência, profissão com bônus/equipamento/dinheiro).
- Distribuição dos 5 pontos de atributo na criação (VIGOR, ACUIDADE, PSICOMETRIA, ESOTERISMO, RAZÃO), respeitando o limite de -5 a 10.
- PSICOMETRIA com escolha do sub-atributo dominante (Inteligência ou Sapiência), aplicando o reforço -3 no secundário.
- Cálculo automático de Vida máxima (VIGOR+10), Fôlego máximo (VIGOR) e Sanidade Total (RAZÃO + 1d6, com botão de rolagem, mínimo 2).
- Aplicação automática dos bônus numéricos de atributo da profissão escolhida.
- Rastreamento de Vida/Fôlego/Sanidade atuais durante o jogo, Conhecimento (%), Nível e Status (Exaustão, Insano, Ansioso, etc).
- Inventário livre e lista de Rituais/Magias conhecidas.
- Exportar/Importar a ficha como arquivo `.json` (para salvar e continuar depois).

## Como rodar

Pré-requisitos: Node.js 18+ e npm.

```bash
npm install
npm start
```

Depois abra `http://localhost:4200` no navegador.

## Build de produção

```bash
npm run build
```

Os arquivos finais ficam em `dist/limiar-ficha`, prontos para hospedar em qualquer servidor estático.

## Estrutura

```
src/
  app/
    app.component.ts     -> lógica e regras do sistema (atributos, fórmulas, profissões)
    app.component.html   -> template da ficha
    app.component.css    -> estilos
    data/professions.ts  -> tabela de profissões do livro
  main.ts
  index.html
  styles.css
```
