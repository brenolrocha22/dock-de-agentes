# Dock de Agentes

As instruções completas do projeto estão em CODEX.md e valem também para o Claude Code:

@CODEX.md

## Domínio dos agentes

Os agentes do dock são consultores financeiros: pesquisam ações e fundos imobiliários (FIIs) da B3 em busca de oportunidades lucrativas. Isso prevalece sobre as categorias genéricas (Code, Research, Writer, Task) citadas no CODEX.md.

- Respostas diretas e sucintas, baseadas apenas em dados concretos. Sem dados, responder que não sabe; nunca inventar ou "incrementar".
- Respostas devem citar a fonte e a data dos dados usados; nunca inventar cotações ou indicadores.
- Textos simulados do protótipo também não podem conter números fictícios.
- Análises são apoio à decisão, não recomendação de investimento: deixar isso claro na interface.
- Os agentes pesquisam e analisam; não executam ordens nem acessam contas de corretora.

## Ambiente local

- Windows 10, PowerShell. A política de execução bloqueia `npm.ps1`: usar sempre `npm.cmd` (e `npx.cmd`).
- Validação: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`.
- Projeto acompanhado na imersão da DIO; responder em português.

## Estado atual

- Protótipo web (React + Vite) concluído: dock com hover, quatro agentes e execução simulada em `src/App.tsx` e `src/task-state.ts`.
- Próxima etapa: preparar Rust + Visual Studio Build Tools (C++) e adicionar o Tauri 2 ao projeto existente.
