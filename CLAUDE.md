# Dock de Agentes

As instruções completas do projeto estão em CODEX.md e valem também para o Claude Code:

@CODEX.md

## Ambiente local

- Windows 10, PowerShell. A política de execução bloqueia `npm.ps1`: usar sempre `npm.cmd` (e `npx.cmd`).
- Validação: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`.
- Projeto acompanhado na imersão da DIO; responder em português.

## Estado atual

- Protótipo web (React + Vite) concluído: dock com hover, quatro agentes e execução simulada em `src/App.tsx` e `src/task-state.ts`.
- Próxima etapa: preparar Rust + Visual Studio Build Tools (C++) e adicionar o Tauri 2 ao projeto existente.
