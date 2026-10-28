# Dock de Agentes — plano do protótipo web

## Objetivo
Construir a primeira validação visual do Dock de Agentes como uma interface React executada no navegador. O protótipo deve demonstrar um dock compacto que se expande ao passar o cursor e permite abrir painéis de agentes simulados, sem integrar IA ou serviços externos.

## Usuário e necessidade
Uma pessoa que trabalha no Windows quer acessar rapidamente ferramentas de agente sem interromper o fluxo de trabalho. Esta fase valida a hierarquia visual e as interações básicas antes de investir na janela nativa Tauri.

## Escopo da V1 de protótipo
- Aplicação React + TypeScript, executada localmente com Vite e npm.
- Dock visual fixo na parte inferior da janela do navegador, com estado compacto e expansão por hover/foco.
- Ações para Code, Research, Writer e Tasks.
- Painel de agente com descrição, campo de tarefa e execução simulada com estados ocioso, executando e concluído.
- Animações discretas com Motion e estilização com Tailwind CSS.
- Layout responsivo e estados acessíveis por teclado.

## Fora do escopo desta fase
- Janela transparente e sem bordas do Windows, posicionamento fora do navegador, integração com outras janelas ou eventos globais do sistema.
- Tauri, código Rust, Claude Agent SDK, execução real de agentes, SQLite, histórico persistente e inicialização com o Windows.
- Docker. O protótipo web não exige container.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Motion
- npm

## Critérios de aceite
1. A aplicação inicia localmente e apresenta o dock sem erros de compilação.
2. O dock expande e recolhe por hover e foco de teclado.
3. Cada um dos quatro botões abre o painel correspondente.
4. Enviar uma tarefa simulada exibe os estados de execução e conclusão sem chamar serviços externos.
5. O layout continua utilizável em larguras menores e respeita movimento reduzido quando configurado no sistema.

## Observação de ambiente
Node.js, npm e Git estão disponíveis neste workspace. Como a política atual do PowerShell bloqueia `npm.ps1`, os comandos npm serão executados por `npm.cmd`. Rust/Cargo e o compilador C++ do Visual Studio não estão disponíveis neste terminal; não são necessários para este protótipo web e serão reavaliados ao iniciar a fase Tauri.

## Próxima fase
Após validar este protótipo, preparar o ambiente nativo Windows e portar a interface para Tauri 2, validando transparência, comportamento de janela e interação com outras aplicações antes de integrar agentes reais.
